import uuid

from fastapi import HTTPException, status
from langchain_core.messages import HumanMessage
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.llm.factory import UnsupportedProviderError, get_provider
from app.models import Case, Conversation, ConversationStatus, Message, Persona, SenderRole
from app.prompts.system_prompt_builder import build_system_prompt
from app.services.session_service import SessionService


class ChatService:
    def __init__(self, db: AsyncSession, redis: Redis):
        self.db = db
        self.sessions = SessionService(redis)

    async def start_conversation(
        self,
        *,
        clerk_user_id: str,
        case_id: uuid.UUID,
        persona_id: uuid.UUID,
        llm_provider: str,
        llm_model: str,
    ) -> tuple[Conversation, str]:
        case = await self.db.get(Case, case_id)
        persona = await self.db.get(Persona, persona_id)
        if not case or not persona or persona.case_id != case.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Case/persona not found or mismatched")

        try:
            get_provider(llm_provider)
        except UnsupportedProviderError as exc:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc

        conversation = Conversation(
            case_id=case_id,
            persona_id=persona_id,
            clerk_user_id=clerk_user_id,
            llm_provider=llm_provider,
            llm_model=llm_model,
            status=ConversationStatus.ACTIVE,
        )
        self.db.add(conversation)
        await self.db.commit()
        await self.db.refresh(conversation)

        system_prompt = build_system_prompt(case, persona)
        await self.sessions.init_history(conversation.id, system_prompt)

        # Prime the persona with an opening line so the student has someone to greet.
        provider = get_provider(llm_provider)
        opening_line = await provider.generate(
            llm_model,
            [*await self.sessions.get_messages(conversation.id),
             HumanMessage(content="(සිසුවා දැන් කාමරයට ඇතුළු වේ. ඔබව සුබ පැතීමට ඉඩ දෙන්න.)")],
        )
        await self.sessions.append(conversation.id, "patient", opening_line)
        await self._persist_message(conversation.id, SenderRole.PATIENT, opening_line)

        return conversation, opening_line

    async def send_message(
        self, *, conversation_id: uuid.UUID, clerk_user_id: str, student_message: str
    ) -> str:
        conversation = await self.db.get(Conversation, conversation_id)
        if not conversation or conversation.clerk_user_id != clerk_user_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
        if conversation.status != ConversationStatus.ACTIVE:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Conversation is not active")

        if not await self.sessions.exists(conversation_id):
            # Redis TTL expired but Postgres record still exists — rebuild the cache.
            await self._rehydrate_session(conversation)

        await self.sessions.append(conversation_id, "student", student_message)
        await self._persist_message(conversation_id, SenderRole.STUDENT, student_message)

        provider = get_provider(conversation.llm_provider)
        messages = await self.sessions.get_messages(conversation_id)
        reply = await provider.generate(conversation.llm_model, messages)

        await self.sessions.append(conversation_id, "patient", reply)
        await self._persist_message(conversation_id, SenderRole.PATIENT, reply)
        return reply

    async def _persist_message(self, conversation_id: uuid.UUID, role: SenderRole, content: str) -> None:
        self.db.add(Message(conversation_id=conversation_id, role=role, content=content))
        await self.db.commit()

    async def _rehydrate_session(self, conversation: Conversation) -> None:
        case = await self.db.get(Case, conversation.case_id)
        persona = await self.db.get(Persona, conversation.persona_id)
        system_prompt = build_system_prompt(case, persona)
        await self.sessions.init_history(conversation.id, system_prompt)

        result = await self.db.execute(
            select(Message).where(Message.conversation_id == conversation.id).order_by(Message.created_at)
        )
        for msg in result.scalars():
            role = "student" if msg.role == SenderRole.STUDENT else "patient"
            await self.sessions.append(conversation.id, role, msg.content)
