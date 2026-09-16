from fastapi import APIRouter

from backend.app.api.deps import CurrentUserId, DbSession, RedisClient
from backend.app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    StartConversationRequest,
    StartConversationResponse,
)
from backend.app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/start", response_model=StartConversationResponse)
async def start_conversation(
    payload: StartConversationRequest,
    db: DbSession,
    redis: RedisClient,
    user_id: CurrentUserId,
) -> StartConversationResponse:
    service = ChatService(db, redis)
    conversation, opening_line = await service.start_conversation(
        clerk_user_id=user_id,
        case_id=payload.case_id,
        persona_id=payload.persona_id,
        llm_provider=payload.llm_provider,
        llm_model=payload.llm_model,
    )
    return StartConversationResponse(conversation_id=conversation.id, opening_line=opening_line)


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    payload: ChatMessageRequest,
    db: DbSession,
    redis: RedisClient,
    user_id: CurrentUserId,
) -> ChatMessageResponse:
    service = ChatService(db, redis)
    reply = await service.send_message(
        conversation_id=payload.conversation_id,
        clerk_user_id=user_id,
        student_message=payload.message,
    )
    return ChatMessageResponse(conversation_id=payload.conversation_id, reply=reply)
