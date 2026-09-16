from backend.app.llm.base import ChatProvider
from backend.app.llm.providers.claude_provider import ClaudeProvider
from backend.app.llm.providers.gemini_provider import GeminiProvider
from backend.app.llm.providers.huggingface_local import HuggingFaceLocalProvider
from backend.app.llm.providers.openai_provider import OpenAIProvider


class UnsupportedProviderError(ValueError):
    pass


_PROVIDERS: dict[str, type[ChatProvider]] = {
    "openai": OpenAIProvider,
    "gemini": GeminiProvider,
    "anthropic": ClaudeProvider,
    "hf_local": HuggingFaceLocalProvider,
}


def get_provider(provider_name: str) -> ChatProvider:
    try:
        return _PROVIDERS[provider_name]()
    except KeyError as exc:
        raise UnsupportedProviderError(
            f"Unknown provider '{provider_name}'. Available: {list(_PROVIDERS)}"
        ) from exc
