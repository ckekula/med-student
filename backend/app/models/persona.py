import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.base import Base


class Persona(Base):
    """The simulated patient identity + behaviour the LLM must role-play, in Sinhala."""

    __tablename__ = "personas"

    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    occupation: Mapped[str] = mapped_column(String(100), nullable=True)

    # Free-form traits, e.g. {"anxiety_level": "high", "cooperativeness": "reluctant"}
    personality_traits: Mapped[dict] = mapped_column(JSONB, default=dict)

    backstory: Mapped[str] = mapped_column(Text, nullable=False)  # Sinhala or English context for the LLM

    # The core instruction block combined with global template at runtime (see app/prompts).
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)

    case: Mapped["Case"] = relationship(back_populates="personas")
