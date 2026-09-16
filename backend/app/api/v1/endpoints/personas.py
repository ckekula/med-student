import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from backend.app.api.deps import DbSession
from backend.app.models import Case, Persona
from backend.app.schemas.case import PersonaCreate, PersonaRead

router = APIRouter(prefix="/cases/{case_id}/personas", tags=["personas"])


@router.get("", response_model=list[PersonaRead])
async def list_personas(case_id: uuid.UUID, db: DbSession) -> list[Persona]:
    result = await db.execute(select(Persona).where(Persona.case_id == case_id))
    return list(result.scalars())


@router.post("", response_model=PersonaRead, status_code=status.HTTP_201_CREATED)
async def create_persona(case_id: uuid.UUID, payload: PersonaCreate, db: DbSession) -> Persona:
    case = await db.get(Case, case_id)
    if not case:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Case not found")

    persona = Persona(**payload.model_dump(), case_id=case_id)
    db.add(persona)
    await db.commit()
    await db.refresh(persona)
    return persona
