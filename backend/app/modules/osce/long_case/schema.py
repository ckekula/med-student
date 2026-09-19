import uuid
from datetime import datetime

from app.modules.osce.long_case.enums import *
from app.modules.osce.schema import ORMBase
from pydantic import BaseModel, Field


# LongCase
class LongCaseBase(BaseModel):
    title: str = Field(..., max_length=255)
    specialty: Specialty
    category: LongCaseCategory | None = None
    difficulty: DifficultyLevel = DifficultyLevel.FINAL_MBBS
    description: str | None = None
    time_limit_seconds: int | None = None
    is_active: bool = True
    differential_diagnoses: list[str] = Field(default_factory=list)
    supporting_features: list[str] | None = Field(default_factory=list)


class LongCaseCreate(LongCaseBase):
    pass


class LongCaseUpdate(BaseModel):
    title: str | None = Field(None, max_length=255)
    specialty: Specialty | None = None
    category: LongCaseCategory | None = None
    difficulty: DifficultyLevel | None = None
    description: str | None = None
    time_limit_seconds: int | None = None
    is_active: bool | None = None
    differential_diagnoses: list[str] | None = None
    supporting_features: list[str] | None = None


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
    is_critical: bool = False


class HistoryItemCreate(HistoryItemBase):
    pass


class HistoryItemUpdate(BaseModel):
    category: HistoryItemCategory | None = None
    description: str | None = None
    points: float | None = None
    is_critical: bool | None = None


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


# Composite detail view — GET /long-cases/{id}
class LongCaseDetail(LongCaseRead):
    patient_profile: PatientProfileRead | None = None
    history_items: list[HistoryItemRead] = Field(default_factory=list)
    examinations: list[LongCaseExaminationRead] = Field(default_factory=list)
    investigations: list[LongCaseInvestigationRead] = Field(default_factory=list)