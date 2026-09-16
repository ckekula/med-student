from langchain_anthropic import ChatAnthropic
from langchain_core.language_models.chat_models import BaseChatModel

from backend.app.config import get_settings
from backend.app.llm.base import ChatProvider

settings = get_settings()


class ClaudeProvider(ChatProvider):
    provider_name = "anthropic"

    def build(self, model_name: str, **kwargs) -> BaseChatModel:
        return ChatAnthropic(
            model=model_name,
            api_key=settings.ANTHROPIC_API_KEY,
            temperature=kwargs.pop("temperature", 0.7),
            **kwargs,
        )
