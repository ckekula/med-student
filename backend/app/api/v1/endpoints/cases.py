import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from backend.app.api.deps import CurrentUserId, DbSession
from backend.app.models import Case
from backend.app.schemas.case import CaseCreate, CaseRead

router = APIRouter(prefix="/cases", tags=["cases"])


@router.get("", response_model=list[CaseRead])
async def list_cases(db: DbSession, active_only: bool = True) -> list[Case]:
    stmt = select(Case)
    if active_only:
        stmt = stmt.where(Case.is_active.is_(True))
    result = await db.execute(stmt)
    return list(result.scalars().unique())


@router.post("", response_model=CaseRead, status_code=status.HTTP_201_CREATED)
async def create_case(payload: CaseCreate, db: DbSession, user_id: CurrentUserId) -> Case:
    case = Case(**payload.model_dump(), created_by=user_id)
    db.add(case)
    await db.commit()
    await db.refresh(case)
    return case


@router.get("/{case_id}", response_model=CaseRead)
async def get_case(case_id: uuid.UUID, db: DbSession) -> Case:
    case = await db.get(Case, case_id)
    if not case:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Case not found")
    return case
