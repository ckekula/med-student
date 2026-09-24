import uuid
from datetime import datetime
from typing import Annotated

from app.modules.osce.long_case.enums import *
from app.modules.osce.schema import ORMBase
from pydantic import BaseModel, Field, model_validator


# LongCase
class LongCaseBase(BaseModel):
    title: str = Field(..., max_length=255)
    specialty: Specialty
    category: LongCaseCategory | None = None
    difficulty: DifficultyLevel = DifficultyLevel.FINAL_MBBS
    description: str | None = None
    is_active: bool = True


class LongCaseCreate(LongCaseBase):
    pass


class LongCaseUpdate(BaseModel):
    title: str | None = Field(None, max_length=255)
    specialty: Specialty | None = None
    category: LongCaseCategory | None = None
    difficulty: DifficultyLevel | None = None
    description: str | None = None
    is_active: bool | None = None


class LongCaseRead(LongCaseBase, ORMBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# PatientProfile (singleton per long case)
class PatientProfileBase(BaseModel):
    name: str | None = Field(None, max_length=100)
    age: int | None = None
    sex: str | None = Field(None, max_length=20)
    occupation: str | None = Field(None, max_length=150)
    location: str | None = Field(None, max_length=150)
    marital_status: str | None = Field(None, max_length=50)
    height_cm: float | None = None
    weight_kg: float | None = None


class PatientProfileCreate(PatientProfileBase):
    pass


class PatientProfileUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    age: int | None = None
    sex: str | None = Field(None, max_length=20)
    occupation: str | None = Field(None, max_length=150)
    location: str | None = Field(None, max_length=150)
    marital_status: str | None = Field(None, max_length=50)
    height_cm: float | None = None
    weight_kg: float | None = None


class PatientProfileRead(PatientProfileBase, ORMBase):
    id: uuid.UUID
    long_case_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# HistoryItem
class HistoryItemBase(BaseModel):
    category: HistoryItemCategory
    description: str
    points: float = 1.0


class HistoryItemCreate(HistoryItemBase):
    pass


class HistoryItemUpdate(BaseModel):
    category: HistoryItemCategory | None = None
    description: str | None = None
    points: float | None = None


class HistoryItemRead(HistoryItemBase, ORMBase):
    id: uuid.UUID
    long_case_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# LongCaseExamination
class LongCaseExaminationBase(BaseModel):
    name: ExaminationName
    findings: str
    points: float = 1.0


class LongCaseExaminationCreate(LongCaseExaminationBase):
    pass


class LongCaseExaminationUpdate(BaseModel):
    name: ExaminationName | None = None
    findings: str | None = None
    points: float | None = None


class LongCaseExaminationRead(LongCaseExaminationBase, ORMBase):
    id: uuid.UUID
    long_case_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# LongCaseInvestigation
class LongCaseInvestigationBase(BaseModel):
    name: InvestigationName
    findings: str
    points: float = 1.0


class LongCaseInvestigationCreate(LongCaseInvestigationBase):
    pass


class LongCaseInvestigationUpdate(BaseModel):
    name: InvestigationName | None = None
    findings: str | None = None
    points: float | None = None


class LongCaseInvestigationRead(LongCaseInvestigationBase, ORMBase):
    id: uuid.UUID
    long_case_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# DifferentialDiagnosis (lower `priority` ranks higher)
class DifferentialDiagnosisBase(BaseModel):
    diagnosis: str = Field(..., max_length=255)
    supporting_features: list[str] = Field(default_factory=list)
    priority: int = Field(1, ge=1)


class DifferentialDiagnosisCreate(DifferentialDiagnosisBase):
    pass


class DifferentialDiagnosisUpdate(BaseModel):
    diagnosis: str | None = Field(None, max_length=255)
    supporting_features: list[str] | None = None
    priority: int | None = Field(None, ge=1)


class DifferentialDiagnosisRead(DifferentialDiagnosisBase, ORMBase):
    id: uuid.UUID
    long_case_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# Composite detail view — GET /long-cases/{id}/details
class LongCaseDetail(LongCaseRead):
    patient_profile: PatientProfileRead | None = None
    history_items: list[HistoryItemRead] = Field(default_factory=list)
    examinations: list[LongCaseExaminationRead] = Field(default_factory=list)
    investigations: list[LongCaseInvestigationRead] = Field(default_factory=list)
    differential_diagnoses: list[DifferentialDiagnosisRead] = Field(default_factory=list)


# Atomic write payloads — POST /long-cases/full and PUT /long-cases/{id}/details
MAX_CHILDREN = 100  # per collection; also bounds `priority` (see service.py)
MAX_POINTS = 999  # the points columns are Numeric(3, 0)

Points = Annotated[int, Field(ge=0, le=MAX_POINTS)]


class WriteChild(BaseModel):
    """A child row in a write payload: `id` present = update that row, absent = create it."""

    id: uuid.UUID | None = None


class HistoryItemWrite(WriteChild):
    category: HistoryItemCategory
    description: str = Field(..., min_length=1)
    points: Points = 1


class LongCaseExaminationWrite(WriteChild):
    name: ExaminationName
    findings: str = Field(..., min_length=1)
    points: Points = 1


class LongCaseInvestigationWrite(WriteChild):
    name: InvestigationName
    findings: str = Field(..., min_length=1)
    points: Points = 1


class DifferentialDiagnosisWrite(WriteChild):
    diagnosis: str = Field(..., min_length=1, max_length=255)
    supporting_features: list[str] = Field(default_factory=list)
    priority: int = Field(..., ge=1, le=MAX_CHILDREN)


def _reject_duplicates(values: list, label: str) -> None:
    if len(values) != len(set(values)):
        raise ValueError(f"Duplicate {label}")


class LongCaseWrite(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    specialty: Specialty
    category: LongCaseCategory  # the column is NOT NULL
    difficulty: DifficultyLevel = DifficultyLevel.FINAL_MBBS
    description: str | None = None
    is_active: bool = True
    patient_profile: PatientProfileCreate | None = None
    history_items: list[HistoryItemWrite] = Field(default_factory=list, max_length=MAX_CHILDREN)
    examinations: list[LongCaseExaminationWrite] = Field(default_factory=list, max_length=MAX_CHILDREN)
    investigations: list[LongCaseInvestigationWrite] = Field(default_factory=list, max_length=MAX_CHILDREN)
    differential_diagnoses: list[DifferentialDiagnosisWrite] = Field(default_factory=list, max_length=MAX_CHILDREN)

    @model_validator(mode="after")
    def _check_uniqueness(self) -> "LongCaseWrite":
        collections = (
            ("history item", self.history_items),
            ("examination", self.examinations),
            ("investigation", self.investigations),
            ("differential diagnosis", self.differential_diagnoses),
        )
        for label, items in collections:
            _reject_duplicates([i.id for i in items if i.id is not None], f"{label} ids")

        # Mirror the unique constraints in models.py so violations are a clear 422, not a DB error.
        _reject_duplicates([e.name for e in self.examinations], "examination names")
        _reject_duplicates([i.name for i in self.investigations], "investigation names")
        _reject_duplicates([d.priority for d in self.differential_diagnoses], "differential diagnosis priorities")
        return self
