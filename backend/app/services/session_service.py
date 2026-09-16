import json
import uuid

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from redis.asyncio import Redis

from backend.app.config import get_settings

settings = get_settings()


def _history_key(conversation_id: uuid.UUID) -> str:
    return f"conv:{conversation_id}:history"


class SessionService:
    """Keeps the hot conversation history in Redis so each turn doesn't hit Postgres
    to rebuild the LLM context. Postgres remains the durable source of truth; this is
    a TTL-bound cache (see `session_service` usage in `chat_service`).
    """

    def __init__(self, redis: Redis):
        self.redis = redis

    async def init_history(self, conversation_id: uuid.UUID, system_prompt: str) -> None:
        history = [{"role": "system", "content": system_prompt}]
        await self._save(conversation_id, history)

    async def append(self, conversation_id: uuid.UUID, role: str, content: str) -> None:
        history = await self._load(conversation_id)
        history.append({"role": role, "content": content})
        await self._save(conversation_id, history)

    async def get_messages(self, conversation_id: uuid.UUID) -> list[BaseMessage]:
        history = await self._load(conversation_id)
        messages: list[BaseMessage] = []
        for turn in history:
            if turn["role"] == "system":
                messages.append(SystemMessage(content=turn["content"]))
            elif turn["role"] == "student":
                messages.append(HumanMessage(content=turn["content"]))
            else:
                messages.append(AIMessage(content=turn["content"]))
        return messages

    async def exists(self, conversation_id: uuid.UUID) -> bool:
        return bool(await self.redis.exists(_history_key(conversation_id)))

    async def _load(self, conversation_id: uuid.UUID) -> list[dict]:
        raw = await self.redis.get(_history_key(conversation_id))
        return json.loads(raw) if raw else []

    async def _save(self, conversation_id: uuid.UUID, history: list[dict]) -> None:
        await self.redis.set(
            _history_key(conversation_id),
            json.dumps(history),
            ex=settings.SESSION_TTL_SECONDS,
        )
