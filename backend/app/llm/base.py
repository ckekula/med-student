from abc import ABC, abstractmethod

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage


class ChatProvider(ABC):
    """Wraps a LangChain chat model so the rest of the app never touches SDK-specific code.

    Every concrete provider just needs to build and return a configured LangChain
    BaseChatModel instance for a given model name. Invocation, retries, and message
    formatting are handled uniformly here.
    """

    provider_name: str

    def __init__(self) -> None:
        self._model_cache: dict[str, BaseChatModel] = {}

    @abstractmethod
    def build(self, model_name: str, **kwargs) -> BaseChatModel: ...

    def _get_model(self, model_name: str, **kwargs) -> BaseChatModel:
        if kwargs:  # custom params: don't cache
            return self.build(model_name, **kwargs)
        if model_name not in self._model_cache:
            self._model_cache[model_name] = self.build(model_name)
        return self._model_cache[model_name]

    async def generate(
        self, model_name: str, messages: list[BaseMessage], **kwargs
    ) -> str | list[str | dict]:
        result = await self._get_model(model_name, **kwargs).ainvoke(messages)
        return result.content
