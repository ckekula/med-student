import uuid

from pydantic import BaseModel, Field


class StartConversationRequest(BaseModel):
    case_id: uuid.UUID
    persona_id: uuid.UUID
    llm_provider: str = Field(description="openai | gemini | anthropic | hf_local")
    llm_model: str = Field(description="e.g. gpt-4o, gemini-1.5-pro, claude-sonnet-4-6, or an HF repo id")


class StartConversationResponse(BaseModel):
    conversation_id: uuid.UUID
    opening_line: str  # patient's first line, in Sinhala, to seed the interview


class ChatMessageRequest(BaseModel):
    conversation_id: uuid.UUID
    message: str = Field(min_length=1, description="Student's question, in Sinhala")


class ChatMessageResponse(BaseModel):
    conversation_id: uuid.UUID
    reply: str  # patient's answer, in Sinhala


class MessageRead(BaseModel):
    role: str
    content: str
