"""LLM-backed patient role-play for the long case history-taking chat.

Kept as a plain async function (not streaming) so the router can await a full
reply and persist it atomically. If streaming is added later, this function's
signature is the seam: swap `provider.generate` for a streamed call and have
the router return a StreamingResponse instead — the prompt-building and
message-mapping logic below does not need to change.
"""

import logging

from app.llm.factory import get_provider
from app.modules.osce.long_case.models import LongCase
from app.modules.osce.long_case_attempt.enums import MessageSender
from app.modules.osce.long_case_attempt.models import LongCaseAttemptMessage
from app.modules.osce.long_case_attempt.prompts import build_patient_system_prompt
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage

logger = logging.getLogger(__name__)

# TODO: move to settings once model/provider selection needs to vary by
# environment or long case. Confirm this is the exact model id you want
# billed against before shipping.
_PROVIDER_NAME = "anthropic"
_MODEL_NAME = "claude-sonnet-4-5"


def _extract_text(content: object) -> str:
    """LangChain chat models normally return `str`, but some providers can
    return a list of content blocks (e.g. tool-use-capable models). Handle
    both so a provider swap doesn't silently break this.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = [
            block if isinstance(block, str) else block.get("text", "")
            for block in content
            if isinstance(block, (str, dict))
        ]
        return "".join(parts)
    return str(content)


def _to_langchain_messages(system_prompt: str, history: list[LongCaseAttemptMessage]) -> list[BaseMessage]:
    messages: list[BaseMessage] = [SystemMessage(content=system_prompt)]
    for message in history:
        if message.sender == MessageSender.STUDENT:
            messages.append(HumanMessage(content=message.content))
        else:
            messages.append(AIMessage(content=message.content))
    return messages


async def generate_patient_reply(long_case: LongCase, history: list[LongCaseAttemptMessage]) -> str:
    """Generates the patient's next reply.

    `history` should be the full transcript for the attempt, in chronological
    order, including the student's latest message. Raises whatever the
    underlying provider raises on failure (network/API errors) — the caller
    is expected to translate that into an HTTP error. This function never
    touches the database, so a failure here never loses already-persisted
    messages.
    """
    system_prompt = build_patient_system_prompt(long_case)
    messages = _to_langchain_messages(system_prompt, history)
    provider = get_provider(_PROVIDER_NAME)
    raw_content = await provider.generate(_MODEL_NAME, messages)
    return _extract_text(raw_content)