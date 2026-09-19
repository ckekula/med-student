import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from app.db.base import Base
from app.modules.osce.long_case.enums import *
from sqlalchemy import (
    ARRAY,
    Boolean,
    CheckConstraint,
    Enum,
    Float,
    ForeignKey,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    # Only needed for the type checker. Otherwise causes circular import
    from app.modules.osce.long_case_attempt.models import LongCaseAttempt


class LongCase(Base):
    __tablename__ = "long_cases"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    specialty: Mapped[Specialty] = mapped_column(Enum(Specialty), nullable=False, index=True)
    category: Mapped[LongCaseCategory] = mapped_column(Enum(LongCaseCategory), nullable=False)
    difficulty: Mapped[DifficultyLevel] = mapped_column(
        Enum(DifficultyLevel), nullable=False, default=DifficultyLevel.FINAL_MBBS
    )
    description: Mapped[str | None] = mapped_column(Text)
    time_limit_seconds: Mapped[int | None] = mapped_column()
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    patient_profile: Mapped["PatientProfile | None"] = relationship(
        back_populates="long_case", uselist=False, cascade="all, delete-orphan"
    )
    history_items: Mapped[list["HistoryItem"]] = relationship(
        back_populates="long_case", cascade="all, delete-orphan"
    )
    examinations: Mapped[list["LongCaseExamination"]] = relationship(
        back_populates="long_case", cascade="all, delete-orphan"
    )
    investigations: Mapped[list["LongCaseInvestigation"]] = relationship(
        back_populates="long_case", cascade="all, delete-orphan"
    )
    differential_diagnoses: Mapped[list["DifferentialDiagnosis"]] = relationship(
        back_populates="long_case", cascade="all, delete-orphan"
    )
 
    # Attempts are preserved: no ORM cascade, and the DB rejects deletion of a
    # case that has attempts (requires ondelete="RESTRICT" on the attempt FK).
    attempts: Mapped[list["LongCaseAttempt"]] = relationship(
        back_populates="long_case", passive_deletes="all"
    )


class PatientProfile(Base):
    """
    A patient profile for a long case, with demographic and social history details.
    """

    __tablename__ = "patient_profiles"

    long_case_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("long_cases.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    name: Mapped[str | None] = mapped_column(String(100))
    age: Mapped[int | None] = mapped_column()
    sex: Mapped[str | None] = mapped_column(String(20))
    occupation: Mapped[str | None] = mapped_column(String(150))
    location: Mapped[str | None] = mapped_column(String(150))
    marital_status: Mapped[str | None] = mapped_column(String(50))
    height_cm: Mapped[float | None] = mapped_column(Float)
    weight_kg: Mapped[float | None] = mapped_column(Float)

    long_case: Mapped["LongCase"] = relationship(back_populates="patient_profile")


class HistoryItem(Base):
    """
    An expected history-taking point. Marked per-attempt as extracted or not.
    Evaluated against the conversation transcript via string match or LLM judge.
    """

    __tablename__ = "history_items"
    __table_args__ = (CheckConstraint("points >= 0", name="ck_history_items_points_non_negative"),)

    long_case_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("long_cases.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category: Mapped[HistoryItemCategory] = mapped_column(
        Enum(HistoryItemCategory), nullable=False, index=True
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    points: Mapped[Decimal] = mapped_column(Numeric(3, 0), nullable=False, default=Decimal(100))

    long_case: Mapped["LongCase"] = relationship(back_populates="history_items")


class LongCaseExamination(Base):
    """
    A physical examination available for this case, with its static findings.
    """

    __tablename__ = "long_case_examinations"
    __table_args__ = (
        UniqueConstraint("long_case_id", "name", name="uq_long_case_examination_name"),
        CheckConstraint("points >= 0", name="ck_long_case_examinations_points_non_negative"),
    )

    long_case_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("long_cases.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[ExaminationName] = mapped_column(Enum(ExaminationName), nullable=False)
    findings: Mapped[str] = mapped_column(Text, nullable=False)
    points: Mapped[Decimal] = mapped_column(Numeric(3, 0), nullable=False, default=Decimal(100))

    long_case: Mapped["LongCase"] = relationship(back_populates="examinations")


class LongCaseInvestigation(Base):
    """
    An investigation available for this case, with its result/findings.
    """

    __tablename__ = "long_case_investigations"
    __table_args__ = (
        UniqueConstraint("long_case_id", "name", name="uq_long_case_investigation_name"),
        CheckConstraint("points >= 0", name="ck_long_case_investigations_points_non_negative"),
    )

    long_case_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("long_cases.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[InvestigationName] = mapped_column(Enum(InvestigationName), nullable=False)
    findings: Mapped[str] = mapped_column(Text, nullable=False)
    points: Mapped[Decimal] = mapped_column(Numeric(3, 0), nullable=False, default=Decimal(100))

    long_case: Mapped["LongCase"] = relationship(back_populates="investigations")


class DifferentialDiagnosis(Base):
    """
    A differential diagnosis for a long case, with its supporting features.
    Lower `priority` values rank higher.
    """

    __tablename__ = "long_case_differential_diagnoses"
    __table_args__ = (
        UniqueConstraint("long_case_id", "priority", name="uq_long_case_differential_diagnosis_priority"),
        CheckConstraint("priority >= 1", name="ck_long_case_differential_diagnoses_priority_positive"),
    )

    long_case_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("long_cases.id", ondelete="CASCADE"), nullable=False
    )
    diagnosis: Mapped[str] = mapped_column(String(255), nullable=False)
    supporting_features: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    priority: Mapped[int] = mapped_column(nullable=False, default=1)

    long_case: Mapped["LongCase"] = relationship(back_populates="differential_diagnoses")


# medicine
# 1. one line intro - no name, gender, age, PC, PMH, smoker? 
# 2. one line HOPC + why this diagnosis
# 3. background - breadwinner, alcoholic, working?, financial status, family history
# 4. examinations - important positives/negatives
# 5. additional details

# surgery
# 1. one line intro - ASA grade
# 2. 
# 3. 
# 4. 
# 5. 

# gyn/obs
# 1.
# 2. 
# 3. 
# 4. 
# 5. 

# pediatrics
# 1.
# 2. 
# 3. 
# 4. 
# 5. 

# psychiatry
# 1.
# 2. 
# 3. 
# 4. 
# 5. 