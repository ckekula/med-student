import uuid
from datetime import datetime
from typing import Annotated

from app.modules.osce.long_case_attempt.enums import *
from app.modules.osce.schema import ORMBase
from pydantic import BaseModel, Field, StringConstraints


# LongCaseAttempt
class LongCaseAttemptCreate(BaseModel):
    long_case_id: uuid.UUID


class LongCaseAttemptUpdate(BaseModel):
    """Progression/evaluation fields. user_id and long_case_id are immutable after creation."""

    status: AttemptStatus | None = None
    total_score: float | None = None


class LongCaseAttemptRead(ORMBase):
    id: uuid.UUID
    user_id: uuid.UUID
    long_case_id: uuid.UUID
    status: AttemptStatus
    total_score: float | None
    created_at: datetime
    updated_at: datetime


# LongCaseAttemptMessage — append-only chat transcript (no update endpoint)
class LongCaseAttemptMessageCreate(BaseModel):
    content: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)]


class LongCaseAttemptMessageRead(ORMBase):
    id: uuid.UUID
    attempt_id: uuid.UUID
    sender: MessageSender
    content: str
    created_at: datetime
    updated_at: datetime


# LongCaseAttemptExaminationSelection — no update endpoint
class LongCaseAttemptExaminationSelectionCreate(BaseModel):
    query_text: str
    examination_id: uuid.UUID | None = None


class LongCaseAttemptExaminationSelectionRead(ORMBase):
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

class LongCaseAttemptChatRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)


class LongCaseAttemptChatResponse(BaseModel):
    user_message: LongCaseAttemptMessageRead
    assistant_message: LongCaseAttemptMessageRead
