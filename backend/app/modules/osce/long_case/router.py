import uuid

from app.dependencies import AdminUser, CurrentUserId, DbSession
from app.modules.osce.long_case.models import (
    HistoryItem,
    LongCase,
    LongCaseExamination,
    LongCaseInvestigation,
    PatientProfile,
)
from app.modules.osce.long_case.schema import (
    HistoryItemCreate,
    HistoryItemRead,
    HistoryItemUpdate,
    LongCaseCreate,
    LongCaseDetail,
    LongCaseExaminationCreate,
    LongCaseExaminationRead,
    LongCaseExaminationUpdate,
    LongCaseInvestigationCreate,
    LongCaseInvestigationRead,
    LongCaseInvestigationUpdate,
    LongCaseRead,
    LongCaseUpdate,
    PatientProfileCreate,
    PatientProfileRead,
    PatientProfileUpdate,
)
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/long-cases", tags=["Long Cases"])


# Helpers
async def _get_long_case_or_404(db: DbSession, long_case_id: uuid.UUID) -> LongCase:
    long_case = await db.get(LongCase, long_case_id)
    if long_case is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Long case not found")
    return long_case


async def _get_nested_or_404(db: DbSession, model, long_case_id: uuid.UUID, item_id: uuid.UUID):
    item = await db.get(model, item_id)
    if item is None or item.long_case_id != long_case_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"{model.__name__} not found")
    return item


# LongCase
@router.post("", response_model=LongCaseRead, status_code=status.HTTP_201_CREATED)
async def create_long_case(payload: LongCaseCreate, db: DbSession, _admin: AdminUser):
    long_case = LongCase(**payload.model_dump())
    db.add(long_case)
    await db.commit()
    await db.refresh(long_case)
    return long_case


@router.get("", response_model=list[LongCaseRead])
async def list_long_cases(
    db: DbSession,
    specialty: str | None = None,
    is_active: bool | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    stmt = select(LongCase)
    if specialty is not None:
        stmt = stmt.where(LongCase.specialty == specialty)
    if is_active is not None:
        stmt = stmt.where(LongCase.is_active == is_active)
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{long_case_id}", response_model=LongCaseRead)
async def get_long_case(long_case_id: uuid.UUID, db: DbSession):
    long_case = await _get_long_case_or_404(db, long_case_id)
    return long_case


@router.get("/{long_case_id}/details", response_model=LongCaseDetail)
async def get_long_case_details(long_case_id: uuid.UUID, db: DbSession):
    stmt = (
        select(LongCase)
        .where(LongCase.id == long_case_id)
        .options(
            selectinload(LongCase.patient_profile),
            selectinload(LongCase.historyItems),
            selectinload(LongCase.examinations),
            selectinload(LongCase.investigations),
        )
    )
    result = await db.execute(stmt)
    long_case = result.scalar_one_or_none()
    if long_case is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Long case not found")
    return LongCaseDetail(
        **LongCaseRead.model_validate(long_case).model_dump(),
        patient_profile=long_case.patient_profile,
        history_items=long_case.historyItems,
        examinations=long_case.examinations,
        investigations=long_case.investigations,
    )


@router.patch("/{long_case_id}", response_model=LongCaseRead)
async def update_long_case(long_case_id: uuid.UUID, payload: LongCaseUpdate, db: DbSession, _admin: AdminUser):
    long_case = await _get_long_case_or_404(db, long_case_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(long_case, field, value)
    await db.commit()
    await db.refresh(long_case)
    return long_case


@router.delete("/{long_case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_long_case(long_case_id: uuid.UUID, db: DbSession, _admin: AdminUser):
    long_case = await _get_long_case_or_404(db, long_case_id)
    await db.delete(long_case)
    await db.commit()


# PatientProfile — singleton per long case
@router.post(
    "/{long_case_id}/patient-profile",
    response_model=PatientProfileRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_patient_profile(long_case_id: uuid.UUID, payload: PatientProfileCreate, db: DbSession, _admin: AdminUser):
    await _get_long_case_or_404(db, long_case_id)
    existing = await db.execute(select(PatientProfile).where(PatientProfile.long_case_id == long_case_id))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Patient profile already exists for this long case")
    profile = PatientProfile(long_case_id=long_case_id, **payload.model_dump())
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/{long_case_id}/patient-profile", response_model=PatientProfileRead)
async def get_patient_profile(long_case_id: uuid.UUID, db: DbSession, _user_id: CurrentUserId):
    result = await db.execute(select(PatientProfile).where(PatientProfile.long_case_id == long_case_id))
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient profile not found")
    return profile


@router.patch("/{long_case_id}/patient-profile", response_model=PatientProfileRead)
async def update_patient_profile(long_case_id: uuid.UUID, payload: PatientProfileUpdate, db: DbSession, _admin: AdminUser):
    result = await db.execute(select(PatientProfile).where(PatientProfile.long_case_id == long_case_id))
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient profile not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.delete("/{long_case_id}/patient-profile", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient_profile(long_case_id: uuid.UUID, db: DbSession, _admin: AdminUser):
    result = await db.execute(select(PatientProfile).where(PatientProfile.long_case_id == long_case_id))
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient profile not found")
    await db.delete(profile)
    await db.commit()


# HistoryItem
@router.post(
    "/{long_case_id}/history-items",
    response_model=HistoryItemRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_history_item(long_case_id: uuid.UUID, payload: HistoryItemCreate, db: DbSession, _admin: AdminUser):
    await _get_long_case_or_404(db, long_case_id)
    item = HistoryItem(long_case_id=long_case_id, **payload.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/{long_case_id}/history-items", response_model=list[HistoryItemRead])
async def list_history_items(long_case_id: uuid.UUID, db: DbSession, _user_id: CurrentUserId):
    result = await db.execute(select(HistoryItem).where(HistoryItem.long_case_id == long_case_id))
    return result.scalars().all()


@router.get("/{long_case_id}/history-items/{item_id}", response_model=HistoryItemRead)
async def get_history_item(long_case_id: uuid.UUID, item_id: uuid.UUID, db: DbSession, _user_id: CurrentUserId):
    return await _get_nested_or_404(db, HistoryItem, long_case_id, item_id)


@router.patch("/{long_case_id}/history-items/{item_id}", response_model=HistoryItemRead)
async def update_history_item(
    long_case_id: uuid.UUID, item_id: uuid.UUID, payload: HistoryItemUpdate, db: DbSession, _admin: AdminUser
):
    item = await _get_nested_or_404(db, HistoryItem, long_case_id, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{long_case_id}/history-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history_item(long_case_id: uuid.UUID, item_id: uuid.UUID, db: DbSession, _admin: AdminUser):
    item = await _get_nested_or_404(db, HistoryItem, long_case_id, item_id)
    await db.delete(item)
    await db.commit()


# LongCaseExamination
@router.post(
    "/{long_case_id}/examinations",
    response_model=LongCaseExaminationRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_examination(long_case_id: uuid.UUID, payload: LongCaseExaminationCreate, db: DbSession, _admin: AdminUser):
    await _get_long_case_or_404(db, long_case_id)
    item = LongCaseExamination(long_case_id=long_case_id, **payload.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/{long_case_id}/examinations", response_model=list[LongCaseExaminationRead])
async def list_examinations(long_case_id: uuid.UUID, db: DbSession, _user_id: CurrentUserId):
    result = await db.execute(select(LongCaseExamination).where(LongCaseExamination.long_case_id == long_case_id))
    return result.scalars().all()


@router.get("/{long_case_id}/examinations/{item_id}", response_model=LongCaseExaminationRead)
async def get_examination(long_case_id: uuid.UUID, item_id: uuid.UUID, db: DbSession, _user_id: CurrentUserId):
    return await _get_nested_or_404(db, LongCaseExamination, long_case_id, item_id)


@router.patch("/{long_case_id}/examinations/{item_id}", response_model=LongCaseExaminationRead)
async def update_examination(
    long_case_id: uuid.UUID,
    item_id: uuid.UUID,
    payload: LongCaseExaminationUpdate,
    db: DbSession,
    _admin: AdminUser,
):
    item = await _get_nested_or_404(db, LongCaseExamination, long_case_id, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{long_case_id}/examinations/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_examination(long_case_id: uuid.UUID, item_id: uuid.UUID, db: DbSession, _admin: AdminUser):
    item = await _get_nested_or_404(db, LongCaseExamination, long_case_id, item_id)
    await db.delete(item)
    await db.commit()


# LongCaseInvestigation
@router.post(
    "/{long_case_id}/investigations",
    response_model=LongCaseInvestigationRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_investigation(
    long_case_id: uuid.UUID, payload: LongCaseInvestigationCreate, db: DbSession, _admin: AdminUser
):
    await _get_long_case_or_404(db, long_case_id)
    item = LongCaseInvestigation(long_case_id=long_case_id, **payload.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/{long_case_id}/investigations", response_model=list[LongCaseInvestigationRead])
async def list_investigations(long_case_id: uuid.UUID, db: DbSession, _user_id: CurrentUserId):
    result = await db.execute(select(LongCaseInvestigation).where(LongCaseInvestigation.long_case_id == long_case_id))
    return result.scalars().all()


@router.get("/{long_case_id}/investigations/{item_id}", response_model=LongCaseInvestigationRead)
async def get_investigation(long_case_id: uuid.UUID, item_id: uuid.UUID, db: DbSession, _user_id: CurrentUserId):
    return await _get_nested_or_404(db, LongCaseInvestigation, long_case_id, item_id)


@router.patch("/{long_case_id}/investigations/{item_id}", response_model=LongCaseInvestigationRead)
async def update_investigation(
    long_case_id: uuid.UUID,
    item_id: uuid.UUID,
    payload: LongCaseInvestigationUpdate,
    db: DbSession,
    _admin: AdminUser,
):
    item = await _get_nested_or_404(db, LongCaseInvestigation, long_case_id, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{long_case_id}/investigations/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_investigation(long_case_id: uuid.UUID, item_id: uuid.UUID, db: DbSession, _admin: AdminUser):
    item = await _get_nested_or_404(db, LongCaseInvestigation, long_case_id, item_id)
    await db.delete(item)
    await db.commit()