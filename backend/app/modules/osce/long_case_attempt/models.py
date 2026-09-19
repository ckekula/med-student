import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from app.db.base import Base
from app.modules.osce.long_case.enums import ExaminationName
from app.modules.osce.long_case_attempt.enums import *
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    # Only needed for the type checker. Otherwise causes circular import.
    from app.modules.osce.long_case.models import (
        HistoryItem,
        LongCase,
    )


class LongCaseAttempt(Base):
    """One student's run through a long case: history chat, exam/investigation phase, and final score."""

    __tablename__ = "long_case_attempts"
    __table_args__ = (
        UniqueConstraint("student_id", "long_case_id", name="uq_student_long_case_attempt"),
        CheckConstraint("total_score >= 0", name="ck_long_case_attempts_total_score_non_negative"),
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # RESTRICT: attempts are preserved. Deactivate a case via `is_active` instead of deleting it.
    long_case_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("long_cases.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    status: Mapped[AttemptStatus] = mapped_column(
        Enum(AttemptStatus), nullable=False, default=AttemptStatus.IN_PROGRESS_HISTORY, index=True
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    history_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    examination_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    summary_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    evaluated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    total_score: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))

    long_case: Mapped["LongCase"] = relationship(back_populates="attempts")
    messages: Mapped[list["LongCaseAttemptMessage"]] = relationship(
        back_populates="attempt",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="LongCaseAttemptMessage.created_at",
    )
    examination_selections: Mapped[list["LongCaseAttemptExaminationSelection"]] = relationship(
        back_populates="attempt", cascade="all, delete-orphan", passive_deletes=True
    )
    checklist_results: Mapped[list["LongCaseAttemptHistoryResult"]] = relationship(
        back_populates="attempt", cascade="all, delete-orphan", passive_deletes=True
    )


class LongCaseAttemptMessage(Base):
    """One turn of the history-taking chat (student question or AI-patient reply)."""

    __tablename__ = "long_case_attempt_messages"

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("long_case_attempts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sender: Mapped[MessageSender] = mapped_column(Enum(MessageSender), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    attempt: Mapped["LongCaseAttempt"] = relationship(back_populates="messages")


class LongCaseAttemptExaminationSelection(Base):
    """
    One examination the student selected during the examination phase.
    examination_id is null when the input didn't match any known examination for
    this case (an irrelevant examination).
    """

    __tablename__ = "long_case_attempt_examination_selections"
    __table_args__ = (
        UniqueConstraint("attempt_id", "examination_name", name="uq_attempt_examination_name"),
    )

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("long_case_attempts.id", ondelete="CASCADE"), nullable=False
    )
    examination_name: Mapped[ExaminationName] = mapped_column(Enum(ExaminationName), nullable=False)
 
    attempt: Mapped["LongCaseAttempt"] = relationship(back_populates="examination_logs")


class LongCaseAttemptHistoryResult(Base):
    """Evaluation outcome of one history checklist item for one attempt (string-match or LLM-judge result)."""

    __tablename__ = "long_case_attempt_checklist_results"
    __table_args__ = (
        UniqueConstraint("attempt_id", "history_item_id", name="uq_attempt_checklist_item"),
        CheckConstraint("score_awarded >= 0", name="ck_attempt_checklist_results_score_non_negative"),
    )

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("long_case_attempts.id", ondelete="CASCADE"), nullable=False
    )
    # removing a history item must not erase students' evaluation records.
    history_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("history_items.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    is_met: Mapped[bool] = mapped_column(Boolean, nullable=False)
    score_awarded: Mapped[Decimal] = mapped_column(Numeric(3, 0), nullable=False)
    evaluation_method_used: Mapped[EvaluationMethod] = mapped_column(
        Enum(EvaluationMethod), nullable=False
    )
    # LLM judge's explanation, or the matched keyword for STRING_MATCH — shown to the student as feedback.
    judge_reasoning: Mapped[str | None] = mapped_column(Text)
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    attempt: Mapped["LongCaseAttempt"] = relationship(back_populates="checklist_results")
    checklist_item: Mapped["HistoryItem"] = relationship()
