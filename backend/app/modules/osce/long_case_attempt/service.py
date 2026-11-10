import asyncio
import logging
import time

from app.config import get_settings
from app.llm.exceptions import LLMError, LLMTimeoutError
from app.llm.factory import get_provider
from app.modules.osce.long_case.models import LongCase
from app.modules.osce.long_case_attempt.enums import MessageSender
from app.modules.osce.long_case_attempt.models import LongCaseAttemptMessage
from app.modules.osce.long_case_attempt.prompts import build_patient_system_prompt
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage

logger = logging.getLogger(__name__)


def _extract_text(content: str | list) -> str:
    if isinstance(content, str):
        return content
    return "".join(
        block if isinstance(block, str) else block.get("text", "")
        for block in content
        if isinstance(block, str) or (isinstance(block, dict) and block.get("type") == "text")
    )


def _window(history: list[LongCaseAttemptMessage], limit: int) -> list[LongCaseAttemptMessage]:
    window = history[-limit:]
    # Providers require the conversation to open with a human turn.
    first_user = next((i for i, m in enumerate(window) if m.sender == MessageSender.USER), len(window))
    return window[first_user:]


def _to_langchain_messages(system_prompt: str, history: list[LongCaseAttemptMessage]) -> list[BaseMessage]:
    messages: list[BaseMessage] = [SystemMessage(content=system_prompt)]
    for message in history:
        if message.sender == MessageSender.USER:
            messages.append(HumanMessage(content=message.content))
        elif message.sender == MessageSender.PATIENT:
            messages.append(AIMessage(content=message.content))
        else:
            raise ValueError(f"Unsupported sender: {message.sender!r}")
    return messages


async def generate_patient_reply(long_case: LongCase, history: list[LongCaseAttemptMessage]) -> str:
    """Generates the patient's next reply from the full transcript (latest user message last).

    Never touches the database. Raises LLMTimeoutError / LLMError on failure.
    """
    settings = get_settings()
    provider = get_provider(settings.DEFAULT_LLM_PROVIDER)
    messages = _to_langchain_messages(
        build_patient_system_prompt(long_case),
        _window(history, settings.LLM_MAX_HISTORY_MESSAGES),
    )

    started = time.perf_counter()
    try:
        async with asyncio.timeout(settings.LLM_TIMEOUT_SECONDS * (settings.LLM_MAX_RETRIES + 1)):
            raw = await provider.generate(settings.DEFAULT_LLM_MODEL, messages)
    except TimeoutError as exc:
        raise LLMTimeoutError("LLM call timed out") from exc
    except Exception as exc:
        logger.exception("LLM call failed (provider=%s, model=%s)", settings.DEFAULT_LLM_PROVIDER, settings.DEFAULT_LLM_MODEL)
        raise LLMError("LLM call failed") from exc

    reply = _extract_text(raw).strip()
    if not reply:
        raise LLMError("LLM returned an empty reply")

    logger.info(
        "LLM reply generated (provider=%s, model=%s, latency_ms=%d)",
        settings.DEFAULT_LLM_PROVIDER, settings.DEFAULT_LLM_MODEL, (time.perf_counter() - started) * 1000,
    )
    return reply
