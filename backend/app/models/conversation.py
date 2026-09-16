import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.base import Base


class ConversationStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class SenderRole(str, enum.Enum):
    STUDENT = "student"
    PATIENT = "patient"


class Conversation(Base):
    """One OSCE practice session: a student interviewing a persona for a given case."""

    __tablename__ = "conversations"

    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    persona_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("personas.id"), nullable=False)

    clerk_user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    llm_provider: Mapped[str] = mapped_column(String(50), nullable=False)  # openai|gemini|anthropic|hf_local
    llm_model: Mapped[str] = mapped_column(String(100), nullable=False)

    status: Mapped[ConversationStatus] = mapped_column(
        Enum(ConversationStatus, name="conversation_status"), default=ConversationStatus.ACTIVE
    )

    messages: Mapped[list["Message"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at"
    )


class Message(Base):
    """A single turn in the conversation, stored in Sinhala as typed/spoken."""

    __tablename__ = "messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False
    )
    role: Mapped[SenderRole] = mapped_column(Enum(SenderRole, name="sender_role"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)  # Sinhala text

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")
