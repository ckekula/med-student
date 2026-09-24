import uuid
from datetime import UTC, datetime

from app.dependencies import AdminUser, CurrentDbUser, DbSession
from app.modules.osce.long_case.models import LongCase
from app.modules.osce.long_case_attempt.enums import MessageSender
from app.modules.osce.long_case_attempt.llm_chat import generate_patient_reply
from app.modules.osce.long_case_attempt.models import (
    LongCaseAttempt,
    LongCaseAttemptExaminationSelection,
    LongCaseAttemptHistoryResult,
    LongCaseAttemptMessage,
)
from app.modules.osce.long_case_attempt.schema import (
    LongCaseAttemptChatRequest,
    LongCaseAttemptChatResponse,
    LongCaseAttemptCreate,
    LongCaseAttemptExaminationSelectionCreate,
    LongCaseAttemptExaminationSelectionRead,
    LongCaseAttemptHistoryResultCreate,
    LongCaseAttemptHistoryResultRead,
    LongCaseAttemptHistoryResultUpdate,
    LongCaseAttemptMessageCreate,
    LongCaseAttemptMessageRead,
    LongCaseAttemptRead,
    LongCaseAttemptUpdate,
)
from fastapi import APIRouter, HTTPException, Query, logger, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/long-case-attempts", tags=["Long Case Attempts"])


# Helpers
async def _get_own_attempt_or_404(db: DbSession, user: CurrentDbUser, attempt_id: uuid.UUID) -> LongCaseAttempt:
    attempt = await db.get(LongCaseAttempt, attempt_id)
    if attempt is None or attempt.student_id != user.id:
        # 404 (not 403) so we don't leak the existence of other students' attempts.
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Attempt not found")
    return attempt


async def _get_nested_or_404(db: DbSession, model, attempt_id: uuid.UUID, item_id: uuid.UUID):
    item = await db.get(model, item_id)
    if item is None or item.attempt_id != attempt_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"{model.__name__} not found")
    return item


# LongCaseAttempt
@router.post("", response_model=LongCaseAttemptRead, status_code=status.HTTP_201_CREATED)
async def create_attempt(payload: LongCaseAttemptCreate, db: DbSession, user: CurrentDbUser):
    long_case = await db.get(LongCase, payload.long_case_id)
    if long_case is None or not long_case.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Long case not found")

    attempt = LongCaseAttempt(
        student_id=user.id,
        long_case_id=payload.long_case_id,
        started_at=datetime.now(UTC),
    )
    db.add(attempt)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "An attempt for this long case already exists") from exc
    await db.refresh(attempt)
    return attempt


@router.get("", response_model=list[LongCaseAttemptRead])
async def list_my_attempts(
    db: DbSession,
    user: CurrentDbUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    stmt = select(LongCaseAttempt).where(LongCaseAttempt.student_id == user.id).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{attempt_id}", response_model=LongCaseAttemptRead)
async def get_attempt(attempt_id: uuid.UUID, db: DbSession, user: CurrentDbUser):
    return await _get_own_attempt_or_404(db, user, attempt_id)


@router.patch("/{attempt_id}", response_model=LongCaseAttemptRead)
async def update_attempt(attempt_id: uuid.UUID, payload: LongCaseAttemptUpdate, db: DbSession, user: CurrentDbUser):
    attempt = await _get_own_attempt_or_404(db, user, attempt_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(attempt, field, value)
    await db.commit()
    await db.refresh(attempt)
    return attempt


@router.delete("/{attempt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attempt(attempt_id: uuid.UUID, db: DbSession, admin: AdminUser):
    attempt = await _get_own_attempt_or_404(db, admin, attempt_id)
    await db.delete(attempt)
    await db.commit()


# LongCaseAttemptMessage — append-only chat transcript
@router.post(
    "/{attempt_id}/messages",
    response_model=LongCaseAttemptMessageRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_message(attempt_id: uuid.UUID, payload: LongCaseAttemptMessageCreate, db: DbSession, user: CurrentDbUser):
    await _get_own_attempt_or_404(db, user, attempt_id)
    message = LongCaseAttemptMessage(attempt_id=attempt_id, **payload.model_dump())
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


@router.get("/{attempt_id}/messages", response_model=list[LongCaseAttemptMessageRead])
async def list_messages(attempt_id: uuid.UUID, db: DbSession, user: CurrentDbUser):
    await _get_own_attempt_or_404(db, user, attempt_id)
    result = await db.execute(
        select(LongCaseAttemptMessage)
        .where(LongCaseAttemptMessage.attempt_id == attempt_id)
        .order_by(LongCaseAttemptMessage.created_at)
    )
    return result.scalars().all()


@router.get("/{attempt_id}/messages/{message_id}", response_model=LongCaseAttemptMessageRead)
async def get_message(attempt_id: uuid.UUID, message_id: uuid.UUID, db: DbSession, user: CurrentDbUser):
    await _get_own_attempt_or_404(db, user, attempt_id)
    return await _get_nested_or_404(db, LongCaseAttemptMessage, attempt_id, message_id)


@router.delete("/{attempt_id}/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(attempt_id: uuid.UUID, message_id: uuid.UUID, db: DbSession, admin: AdminUser):
    await _get_own_attempt_or_404(db, admin, attempt_id)
    message = await _get_nested_or_404(db, LongCaseAttemptMessage, attempt_id, message_id)
    await db.delete(message)
    await db.commit()


# LongCaseAttemptExaminationSelection
@router.post(
    "/{attempt_id}/examination-selections",
    response_model=LongCaseAttemptExaminationSelectionRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_examination_log(
    attempt_id: uuid.UUID, payload: LongCaseAttemptExaminationSelectionCreate, db: DbSession, user: CurrentDbUser
):
    await _get_own_attempt_or_404(db, user, attempt_id)
    log = LongCaseAttemptExaminationSelection(attempt_id=attempt_id, created_at=datetime.now(UTC), **payload.model_dump())
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


@router.get("/{attempt_id}/examination-selections", response_model=list[LongCaseAttemptExaminationSelectionRead])
async def list_examination_selections(attempt_id: uuid.UUID, db: DbSession, user: CurrentDbUser):
    await _get_own_attempt_or_404(db, user, attempt_id)
    result = await db.execute(
        select(LongCaseAttemptExaminationSelection).where(LongCaseAttemptExaminationSelection.attempt_id == attempt_id)
    )
    return result.scalars().all()


@router.get("/{attempt_id}/examination-selections/{log_id}", response_model=LongCaseAttemptExaminationSelectionRead)
async def get_examination_log(attempt_id: uuid.UUID, log_id: uuid.UUID, db: DbSession, user: CurrentDbUser):
    await _get_own_attempt_or_404(db, user, attempt_id)
    return await _get_nested_or_404(db, LongCaseAttemptExaminationSelection, attempt_id, log_id)


@router.delete("/{attempt_id}/examination-selections/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_examination_log(attempt_id: uuid.UUID, log_id: uuid.UUID, db: DbSession, admin: AdminUser):
    await _get_own_attempt_or_404(db, admin, attempt_id)
    log = await _get_nested_or_404(db, LongCaseAttemptExaminationSelection, attempt_id, log_id)
    await db.delete(log)
    await db.commit()


# LongCaseAttemptHistoryResult — evaluation outcomes, correctable
@router.post(
    "/{attempt_id}/history-results",
    response_model=LongCaseAttemptHistoryResultRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_history_result(
    attempt_id: uuid.UUID, payload: LongCaseAttemptHistoryResultCreate, db: DbSession, user: CurrentDbUser
):
    await _get_own_attempt_or_404(db, user, attempt_id)
    result_row = LongCaseAttemptHistoryResult(attempt_id=attempt_id, **payload.model_dump())
    db.add(result_row)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "A result for this history item already exists") from exc
    await db.refresh(result_row)
    return result_row


@router.get("/{attempt_id}/history-results", response_model=list[LongCaseAttemptHistoryResultRead])
async def list_history_results(attempt_id: uuid.UUID, db: DbSession, user: CurrentDbUser):
    await _get_own_attempt_or_404(db, user, attempt_id)
    result = await db.execute(
        select(LongCaseAttemptHistoryResult).where(LongCaseAttemptHistoryResult.attempt_id == attempt_id)
    )
    return result.scalars().all()


@router.get("/{attempt_id}/history-results/{result_id}", response_model=LongCaseAttemptHistoryResultRead)
async def get_history_result(attempt_id: uuid.UUID, result_id: uuid.UUID, db: DbSession, user: CurrentDbUser):
    await _get_own_attempt_or_404(db, user, attempt_id)
    return await _get_nested_or_404(db, LongCaseAttemptHistoryResult, attempt_id, result_id)


@router.patch("/{attempt_id}/history-results/{result_id}", response_model=LongCaseAttemptHistoryResultRead)
async def update_history_result(
    attempt_id: uuid.UUID,
    result_id: uuid.UUID,
    payload: LongCaseAttemptHistoryResultUpdate,
    db: DbSession,
    user: CurrentDbUser,
):
    await _get_own_attempt_or_404(db, user, attempt_id)
    result_row = await _get_nested_or_404(db, LongCaseAttemptHistoryResult, attempt_id, result_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(result_row, field, value)
    await db.commit()
    await db.refresh(result_row)
    return result_row


@router.delete("/{attempt_id}/history-results/{result_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history_result(attempt_id: uuid.UUID, result_id: uuid.UUID, db: DbSession, admin: AdminUser):
    await _get_own_attempt_or_404(db, admin, attempt_id)
    result_row = await _get_nested_or_404(db, LongCaseAttemptHistoryResult, attempt_id, result_id)
    await db.delete(result_row)
    await db.commit()

async def _get_long_case_with_chat_context_or_404(db: DbSession, long_case_id: uuid.UUID) -> LongCase:
    stmt = (
        select(LongCase)
        .where(LongCase.id == long_case_id)
        .options(
            selectinload(LongCase.patient_profile),
            selectinload(LongCase.historyItems),
            selectinload(LongCase.investigations),
        )
    )
    result = await db.execute(stmt)
    long_case = result.scalar_one_or_none()
    if long_case is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Long case not found")
    return long_case


@router.post(
    "/{attempt_id}/messages/chat",
    response_model=LongCaseAttemptChatResponse,
    status_code=status.HTTP_201_CREATED,
)
async def send_chat_message(
    attempt_id: uuid.UUID, payload: LongCaseAttemptChatRequest, db: DbSession, user: CurrentDbUser
):
    attempt = await _get_own_attempt_or_404(db, user, attempt_id)
    if attempt.history_completed_at is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "History taking has already been completed for this attempt")

    long_case = await _get_long_case_with_chat_context_or_404(db, attempt.long_case_id)

    # Persist the student's message first so it's never lost, even if the LLM call below fails.
    user_message = LongCaseAttemptMessage(attempt_id=attempt_id, sender=MessageSender.STUDENT, content=payload.content)
    db.add(user_message)
    await db.commit()
    await db.refresh(user_message)

    history_result = await db.execute(
        select(LongCaseAttemptMessage)
        .where(LongCaseAttemptMessage.attempt_id == attempt_id)
        .order_by(LongCaseAttemptMessage.created_at)
    )
    history = history_result.scalars().all()

    try:
        reply_content = await generate_patient_reply(long_case, history)
    except Exception as exc:
        logger.exception("Patient chat LLM generation failed for attempt %s", attempt_id)
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "Failed to generate a reply. Your message was saved — please try sending again.",
        ) from exc

    assistant_message = LongCaseAttemptMessage(attempt_id=attempt_id, sender=MessageSender.PATIENT, content=reply_content)
    db.add(assistant_message)
    await db.commit()
    await db.refresh(assistant_message)

    return LongCaseAttemptChatResponse(user_message=user_message, assistant_message=assistant_message)
