import uuid

from pydantic import BaseModel, ConfigDict, Field


class PersonaBase(BaseModel):
    name: str
    age: int = Field(ge=0, le=120)
    gender: str
    occupation: str | None = None
    personality_traits: dict = Field(default_factory=dict)
    backstory: str
    system_prompt: str


class PersonaCreate(PersonaBase):
    pass


class PersonaRead(PersonaBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    case_id: uuid.UUID


class CaseBase(BaseModel):
    title: str
    specialty: str
    diagnosis: str
    difficulty: str = "moderate"
    presenting_complaint: str
    history_notes: str | None = None
    examination_findings: str | None = None
    is_active: bool = True


class CaseCreate(CaseBase):
    pass


class CaseRead(CaseBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    personas: list[PersonaRead] = []
