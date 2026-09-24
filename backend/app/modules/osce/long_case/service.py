"""Atomic create/update of a long case together with all of its child records.

Everything runs in the caller's session and ends in a single commit, so a failure at
any step leaves the database untouched.

Update semantics (PUT), per child collection:
  * child with an `id`      -> updated (the id must belong to this long case, else 422)
  * child without an `id`   -> created
  * existing child not sent -> deleted
Ids are preserved, which keeps references from attempts valid.
"""

import logging
import uuid
from collections.abc import AsyncIterator, Sequence
from contextlib import asynccontextmanager
from typing import Any, TypeVar

from app.modules.osce.long_case.models import (
    DifferentialDiagnosis,
    HistoryItem,
    LongCase,
    LongCaseExamination,
    LongCaseInvestigation,
    PatientProfile,
)
from app.modules.osce.long_case.schema import (
    DifferentialDiagnosisWrite,
    LongCaseWrite,
    PatientProfileCreate,
    WriteChild,
)
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

T = TypeVar("T")

_LONG_CASE_FIELDS = {"title", "specialty", "category", "difficulty", "description", "is_active"}

# Kept differentials are moved to `parking offset + priority` before their final priority is written, so
# re-ordering never violates the unique (long_case_id, priority) constraint halfway through.
# Must be larger than MAX_CHILDREN in schema.py.
_PRIORITY_PARKING_OFFSET = 1_000_000


# Loading
async def load_long_case(db: AsyncSession, long_case_id: uuid.UUID, *, for_update: bool = False) -> LongCase | None:
    """Loads a long case with every child collection; always re-reads from the database."""
    stmt = (
        select(LongCase)
        .where(LongCase.id == long_case_id)
        .options(
            selectinload(LongCase.patient_profile),
            selectinload(LongCase.history_items),
            selectinload(LongCase.examinations),
            selectinload(LongCase.investigations),
            selectinload(LongCase.differential_diagnoses),
        )
        .execution_options(populate_existing=True)
    )
    if for_update:
        # Serialises concurrent edits of the same case.
        stmt = stmt.with_for_update(of=LongCase)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def _reload(db: AsyncSession, long_case_id: uuid.UUID) -> LongCase:
    long_case = await load_long_case(db, long_case_id)
    if long_case is None:  # pragma: no cover - we just committed it
        raise RuntimeError(f"Long case {long_case_id} vanished after commit")
    return long_case


@asynccontextmanager
async def _integrity_guard(db: AsyncSession) -> AsyncIterator[None]:
    """Rolls back and turns database constraint violations into a 409."""
    try:
        yield
    except IntegrityError as exc:
        await db.rollback()
        logger.warning("Long case write rejected by the database: %s", exc.orig)
        raise HTTPException(status.HTTP_409_CONFLICT, "The long case conflicts with existing data.") from exc
    except Exception:
        await db.rollback()
        raise


# Create
async def create_long_case(db: AsyncSession, payload: LongCaseWrite) -> LongCase:
    long_case = LongCase(
        **payload.model_dump(include=_LONG_CASE_FIELDS),
        patient_profile=PatientProfile(**payload.patient_profile.model_dump()) if payload.patient_profile else None,
        history_items=[HistoryItem(**item.model_dump(exclude={"id"})) for item in payload.history_items],
        examinations=[LongCaseExamination(**item.model_dump(exclude={"id"})) for item in payload.examinations],
        investigations=[LongCaseInvestigation(**item.model_dump(exclude={"id"})) for item in payload.investigations],
        differential_diagnoses=[
            DifferentialDiagnosis(**item.model_dump(exclude={"id"})) for item in payload.differential_diagnoses
        ],
    )
    db.add(long_case)

    async with _integrity_guard(db):
        await db.flush()
        long_case_id = long_case.id  # read before commit expires the instance
        await db.commit()

    return await _reload(db, long_case_id)


# Update
async def update_long_case(db: AsyncSession, long_case_id: uuid.UUID, payload: LongCaseWrite) -> LongCase:
    long_case = await load_long_case(db, long_case_id, for_update=True)
    if long_case is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Long case not found")

    async with _integrity_guard(db):
        _assign(long_case, payload.model_dump(include=_LONG_CASE_FIELDS))
        # Bump the timestamp even when only child rows changed.
        long_case.updated_at = func.now()

        await _sync_patient_profile(db, long_case_id, long_case.patient_profile, payload.patient_profile)
        await _sync_plain(db, long_case_id, HistoryItem, long_case.history_items, payload.history_items)
        await _sync_named(db, long_case_id, LongCaseExamination, long_case.examinations, payload.examinations)
        await _sync_named(db, long_case_id, LongCaseInvestigation, long_case.investigations, payload.investigations)
        await _sync_differentials(db, long_case_id, long_case.differential_diagnoses, payload.differential_diagnoses)
        await db.commit()

    return await _reload(db, long_case_id)


# Sync helpers
def _assign(row: object, fields: dict[str, Any]) -> None:
    for name, value in fields.items():
        setattr(row, name, value)


def _match_existing(existing: Sequence[T], items: Sequence[WriteChild]) -> tuple[dict[uuid.UUID, T], list[T]]:
    """Returns existing rows by id, plus the rows the payload no longer contains."""
    by_id = {row.id: row for row in existing}  # type: ignore[attr-defined]
    incoming = {item.id for item in items if item.id is not None}

    unknown = incoming - by_id.keys()
    if unknown:
        ids = ", ".join(sorted(str(i) for i in unknown))
        raise HTTPException(422, f"Unknown child id(s) for this long case: {ids}")

    removed = [row for row in existing if row.id not in incoming]  # type: ignore[attr-defined]
    return by_id, removed


async def _sync_patient_profile(
    db: AsyncSession,
    long_case_id: uuid.UUID,
    existing: PatientProfile | None,
    incoming: PatientProfileCreate | None,
) -> None:
    if incoming is None:
        if existing is not None:
            await db.delete(existing)
    elif existing is None:
        db.add(PatientProfile(long_case_id=long_case_id, **incoming.model_dump()))
    else:
        _assign(existing, incoming.model_dump())


async def _sync_plain(db: AsyncSession, long_case_id: uuid.UUID, model: type, existing: Sequence, items: Sequence) -> None:
    """Sync for collections without unique constraints."""
    by_id, removed = _match_existing(existing, items)
    for row in removed:
        await db.delete(row)

    for item in items:
        fields = item.model_dump(exclude={"id"})
        if item.id is None:
            db.add(model(long_case_id=long_case_id, **fields))
        else:
            _assign(by_id[item.id], fields)


async def _sync_named(db: AsyncSession, long_case_id: uuid.UUID, model: type, existing: Sequence, items: Sequence) -> None:
    """Sync for collections with a unique (long_case_id, name) constraint."""
    by_id, removed = _match_existing(existing, items)
    for row in removed:
        await db.delete(row)
    # Deleted names must be free before anything is renamed or inserted (the unit of work would
    # otherwise run inserts before deletes).
    await db.flush()

    await _apply_renames(db, [(by_id[item.id], item.model_dump(exclude={"id"})) for item in items if item.id])

    for item in items:
        if item.id is None:
            db.add(model(long_case_id=long_case_id, **item.model_dump()))


async def _apply_renames(db: AsyncSession, updates: list[tuple[Any, dict[str, Any]]]) -> None:
    """Applies updates in an order that never has two rows holding the same name at once.

    Names are unique in the payload, so a chain (A->B, B->C) is resolved by moving C first.
    A genuine cycle (A<->B) can't be expressed without a temporary name and is rejected.
    """
    pending = updates
    while pending:
        held = {row.name for row, _ in pending}
        ready = [(row, fields) for row, fields in pending if fields["name"] == row.name or fields["name"] not in held]
        if not ready:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Names can't be swapped between two existing entries in a single save. Change one first, then save again.",
            )
        for row, fields in ready:
            _assign(row, fields)
        await db.flush()

        done = {id(row) for row, _ in ready}
        pending = [(row, fields) for row, fields in pending if id(row) not in done]


async def _sync_differentials(
    db: AsyncSession,
    long_case_id: uuid.UUID,
    existing: Sequence[DifferentialDiagnosis],
    items: Sequence[DifferentialDiagnosisWrite],
) -> None:
    """Sync for differentials, whose (long_case_id, priority) pair is unique."""
    by_id, removed = _match_existing(existing, items)
    for row in removed:
        await db.delete(row)

    kept = [item for item in items if item.id is not None]
    for item in kept:
        by_id[item.id].priority = _PRIORITY_PARKING_OFFSET + item.priority  # type: ignore[index]
    await db.flush()  # deletes + parking, so final priorities are all free

    for item in kept:
        _assign(by_id[item.id], item.model_dump(exclude={"id"}))  # type: ignore[index]
    for item in items:
        if item.id is None:
            db.add(DifferentialDiagnosis(long_case_id=long_case_id, **item.model_dump(exclude={"id"})))
