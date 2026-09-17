from app.db.base import Base
from app.models.enums import *
from app.models.osce.long_case_attempt import LongCaseAttempt
from sqlalchemy import JSON, Boolean, Float, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship


class LongCase(Base):
    __tablename__ = "long_cases"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    specialty: Mapped[Specialty] = mapped_column(Specialty, nullable=False, index=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    difficulty: Mapped[DifficultyLevel] = mapped_column(DifficultyLevel, nullable=False, default=DifficultyLevel.MODERATE)
    description: Mapped[str | None] = mapped_column(Text)
    time_limit_seconds: Mapped[int | None] = mapped_column()
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    presenting_complaint: Mapped[str] = mapped_column(Text, nullable=False)
    duration: Mapped[str | None] = mapped_column(String(100))
    referral_context: Mapped[str | None] = mapped_column(Text)

    patient_profile: Mapped["PatientProfile"] = relationship(back_populates="long_case")
    historyItems: Mapped[list["HistoryItem"]] = relationship(back_populates="long_case", cascade="all, delete-orphan")

    differential_diagnoses: Mapped[list | None] = mapped_column(JSON)
    supporting_features: Mapped[list | None] = mapped_column(JSON)

    examinations: Mapped[list["LongCaseExamination"]] = relationship(back_populates="long_case", cascade="all, delete-orphan")
    investigations: Mapped[list["LongCaseInvestigation"]] = relationship(back_populates="long_case", cascade="all, delete-orphan")
    attempts: Mapped[list["LongCaseAttempt"]] = relationship(back_populates="long_case")


class PatientProfile(Base):
    """
    A patient profile for a long case, with demographic and social history details.
    """

    __tablename__ = "patient_profiles"
    __table_args__ = (UniqueConstraint("long_case_id", "id", name="uq_case_patient_profile"),)

    long_case_id: Mapped[int] = mapped_column(ForeignKey("long_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(100))
    age: Mapped[int | None] = mapped_column()
    sex: Mapped[str | None] = mapped_column(String(20))
    occupation: Mapped[str | None] = mapped_column(String(150))
    location: Mapped[str | None] = mapped_column(String(150))
    marital_status: Mapped[str | None] = mapped_column(String(50))
    height_cm: Mapped[float | None] = mapped_column()
    weight_kg: Mapped[float | None] = mapped_column()


class HistoryItem(Base):
    """
    An expected history-taking point. Marked per-attempt as extracted or not.
    Evaluated against the conversation transcript via string match or LLM judge.
    """

    __tablename__ = "history_items"

    long_case_id: Mapped[int] = mapped_column(ForeignKey("long_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[HistoryItemCategory] = mapped_column(HistoryItemCategory, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    example_question: Mapped[list | None] = mapped_column(JSON)
    points: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    is_critical: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False) # A missed critical item can fail the attempt outright regardless of total score

    long_case: Mapped["LongCase"] = relationship(back_populates="historyItems")


class LongCaseExamination(Base):
    """
    A physical examination available for this case, with its static findings.
    is_required marks it as one of the "correct" examinations to perform;
    """

    __tablename__ = "long_case_examinations"

    long_case_id: Mapped[int] = mapped_column(ForeignKey("long_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)  # e.g. "Cardiovascular examination"
    findings: Mapped[str] = mapped_column(Text, nullable=False)
    points: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)

    long_case: Mapped["LongCase"] = relationship(back_populates="examinations")


class LongCaseInvestigation(Base):
    """
    An investigation available for this case, with its result/findings.
    """

    __tablename__ = "long_case_investigations"

    long_case_id: Mapped[int] = mapped_column(ForeignKey("long_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)  # e.g. "ECG", "Full Blood Count"
    category: Mapped[InvestigationCategory | None] = mapped_column(InvestigationCategory)
    aliases: Mapped[list | None] = mapped_column(JSON)
    findings: Mapped[str] = mapped_column(Text, nullable=False)
    points: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)

    long_case: Mapped["LongCase"] = relationship(back_populates="investigations")


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