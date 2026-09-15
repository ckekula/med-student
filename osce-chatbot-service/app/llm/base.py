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

    @abstractmethod
    def build(self, model_name: str, **kwargs) -> BaseChatModel:
        """Return a configured LangChain chat model for `model_name`."""
        raise NotImplementedError

    async def generate(
        self, model_name: str, messages: list[BaseMessage], **kwargs
    ) -> str:
        llm = self.build(model_name, **kwargs)
        result = await llm.ainvoke(messages)
        return result.content
