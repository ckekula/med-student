from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI

from app.config import get_settings
from app.llm.base import ChatProvider

settings = get_settings()


class OpenAIProvider(ChatProvider):
    provider_name = "openai"

    def build(self, model_name: str, **kwargs) -> BaseChatModel:
        return ChatOpenAI(
            model=model_name,
            api_key=settings.OPENAI_API_KEY,
            temperature=kwargs.pop("temperature", 0.7),
            **kwargs,
        )
