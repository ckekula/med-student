from langchain_core.language_models.chat_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI

from backend.app.config import get_settings
from backend.app.llm.base import ChatProvider

settings = get_settings()


class GeminiProvider(ChatProvider):
    provider_name = "gemini"

    def build(self, model_name: str, **kwargs) -> BaseChatModel:
        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=kwargs.pop("temperature", 0.7),
            **kwargs,
        )
