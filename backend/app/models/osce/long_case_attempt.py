from datetime import datetime

from app.db.base import Base
from app.models.enums import *
from app.models.osce.long_case import (
    HistoryItem,
    LongCase,
    LongCaseExamination,
)
from sqlalchemy import Boolean, Float, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship


class LongCaseAttempt(Base):
    """One student's run through a long case: history chat, exam/investigation phase, and final score."""

    __tablename__ = "long_case_attempts"
    __table_args__ = (UniqueConstraint("student_id", "long_case_id", name="uq_student_long_case_attempt"),)

    student_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    long_case_id: Mapped[int] = mapped_column(ForeignKey("long_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[AttemptStatus] = mapped_column(AttemptStatus, nullable=False, default=AttemptStatus.IN_PROGRESS_HISTORY, index=True)

    started_at: Mapped[datetime] = mapped_column(nullable=False)
    history_completed_at: Mapped[datetime | None] = mapped_column()
    examination_completed_at: Mapped[datetime | None] = mapped_column()
    summary_completed_at: Mapped[datetime | None] = mapped_column()
    evaluated_at: Mapped[datetime | None] = mapped_column()

    # Cached/computed once evaluation runs, so the UI doesn't need to re-aggregate every load.
    total_score: Mapped[float | None] = mapped_column(Float)
    passed: Mapped[bool | None] = mapped_column(Boolean)

    long_case: Mapped["LongCase"] = relationship(back_populates="attempts")
    messages: Mapped[list["LongCaseAttemptMessage"]] = relationship(back_populates="attempt", cascade="all, delete-orphan", order_by="LongCaseAttemptMessage.created_at")
    examination_logs: Mapped[list["LongCaseAttemptExaminationLog"]] = relationship(back_populates="attempt", cascade="all, delete-orphan")
    checklist_results: Mapped[list["LongCaseAttemptHistoryResult"]] = relationship(back_populates="attempt", cascade="all, delete-orphan")


class LongCaseAttemptMessage(Base):
    """One turn of the history-taking chat (student question or AI-patient reply)."""

    __tablename__ = "long_case_attempt_messages"

    attempt_id: Mapped[int] = mapped_column(ForeignKey("long_case_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    sender: Mapped[MessageSender] = mapped_column(MessageSender, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    attempt: Mapped["LongCaseAttempt"] = relationship(back_populates="messages")


class LongCaseAttemptExaminationLog(Base):
    """
    One examination the student typed during the examination phase.
    examination_id is null when the input didn't match any known examination for
    this case (i.e. an irrelevant examination returned nothing to the student).
    """

    __tablename__ = "long_case_attempt_examination_logs"

    attempt_id: Mapped[int] = mapped_column(ForeignKey("long_case_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    query_text: Mapped[str] = mapped_column(String(255), nullable=False)
    examination_id: Mapped[int | None] = mapped_column(ForeignKey("long_case_examinations.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False)

    attempt: Mapped["LongCaseAttempt"] = relationship(back_populates="examination_logs")
    examination: Mapped["LongCaseExamination | None"] = relationship()


class LongCaseAttemptHistoryResult(Base):
    """Evaluation outcome of one history checklist item for one attempt (string-match or LLM-judge result)."""

    __tablename__ = "long_case_attempt_checklist_results"
    __table_args__ = (UniqueConstraint("attempt_id", "checklist_item_id", name="uq_attempt_checklist_item"),)

    attempt_id: Mapped[int] = mapped_column(ForeignKey("long_case_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    history_item_id: Mapped[int] = mapped_column(ForeignKey("long_case_history_checklist_items.id", ondelete="CASCADE"), nullable=False, index=True)

    is_met: Mapped[bool] = mapped_column(Boolean, nullable=False)
    score_awarded: Mapped[float] = mapped_column(Float, nullable=False)
    evaluation_method_used: Mapped[EvaluationMethod] = mapped_column(EvaluationMethod, nullable=False)
    # LLM judge's explanation, or the matched keyword for STRING_MATCH — shown to the student as feedback.
    judge_reasoning: Mapped[str | None] = mapped_column(Text)
    evaluated_at: Mapped[datetime] = mapped_column(nullable=False)

    attempt: Mapped["LongCaseAttempt"] = relationship(back_populates="checklist_results")
    checklist_item: Mapped["HistoryItem"] = relationship()
