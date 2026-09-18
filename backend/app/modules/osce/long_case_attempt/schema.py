import uuid
from datetime import datetime

from app.modules.osce.long_case_attempt.enums import *
from app.modules.osce.schema import ORMBase
from pydantic import BaseModel


# LongCaseAttempt
class LongCaseAttemptCreate(BaseModel):
    long_case_id: uuid.UUID


class LongCaseAttemptUpdate(BaseModel):
    """Progression/evaluation fields. student_id and long_case_id are immutable after creation."""

    status: AttemptStatus | None = None
    history_completed_at: datetime | None = None
    examination_completed_at: datetime | None = None
    summary_completed_at: datetime | None = None
    evaluated_at: datetime | None = None
    total_score: float | None = None
    passed: bool | None = None


class LongCaseAttemptRead(ORMBase):
    id: uuid.UUID
    student_id: uuid.UUID
    long_case_id: uuid.UUID
    status: AttemptStatus
    started_at: datetime
    history_completed_at: datetime | None
    examination_completed_at: datetime | None
    summary_completed_at: datetime | None
    evaluated_at: datetime | None
    total_score: float | None
    passed: bool | None
    created_at: datetime
    updated_at: datetime


# LongCaseAttemptMessage — append-only chat transcript (no update endpoint)
class LongCaseAttemptMessageCreate(BaseModel):
    sender: MessageSender
    content: str


class LongCaseAttemptMessageRead(ORMBase):
    id: uuid.UUID
    attempt_id: uuid.UUID
    sender: MessageSender
    content: str
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# LongCaseAttemptExaminationLog — append-only log (no update endpoint)
# ---------------------------------------------------------------------------
class LongCaseAttemptExaminationLogCreate(BaseModel):
    query_text: str
    examination_id: uuid.UUID | None = None


class LongCaseAttemptExaminationLogRead(ORMBase):
    id: uuid.UUID
    attempt_id: uuid.UUID
    query_text: str
    examination_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


# LongCaseAttemptHistoryResult — evaluation outcomes, correctable
class LongCaseAttemptHistoryResultCreate(BaseModel):
    history_item_id: uuid.UUID
    is_met: bool
    score_awarded: float
    evaluation_method_used: EvaluationMethod
    judge_reasoning: str | None = None
    evaluated_at: datetime


class LongCaseAttemptHistoryResultUpdate(BaseModel):
    is_met: bool | None = None
    score_awarded: float | None = None
    evaluation_method_used: EvaluationMethod | None = None
    judge_reasoning: str | None = None
    evaluated_at: datetime | None = None


class LongCaseAttemptHistoryResultRead(ORMBase):
    id: uuid.UUID
    attempt_id: uuid.UUID
    history_item_id: uuid.UUID
    is_met: bool
    score_awarded: float
    evaluation_method_used: EvaluationMethod
    judge_reasoning: str | None
    evaluated_at: datetime
    created_at: datetime
    updated_at: datetime