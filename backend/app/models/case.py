from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.base import Base


class Case(Base):
    """A medical long-case scenario tested in the OSCE (e.g. 'Acute MI - 58yo male')."""

    __tablename__ = "cases"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    specialty: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    diagnosis: Mapped[str] = mapped_column(String(255), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), default="moderate")  # easy|moderate|hard

    presenting_complaint: Mapped[str] = mapped_column(Text, nullable=False)
    history_notes: Mapped[str] = mapped_column(Text, nullable=True)  # ground-truth for grading
    examination_findings: Mapped[str] = mapped_column(Text, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[str] = mapped_column(String(255), nullable=True)  # Clerk user id (admin)

    personas: Mapped[list["Persona"]] = relationship(back_populates="case", cascade="all, delete-orphan")
