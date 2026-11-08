from enum import Enum

__all__ = [
    "AttemptStatus",
    "EvaluationMethod",
    "MessageSender",
]

class AttemptStatus(Enum):
    STARTED = "started"
    IN_PROGRESS_HISTORY = "in_progress_history"
    HISTORY_COMPLETE = "history_complete"
    IN_PROGRESS_SUMMARY = "in_progress_summary"
    SUMMARY_COMPLETE = "summary_complete"
    EVALUATED = "evaluated"


class MessageSender(Enum):
    USER = "user"
    PATIENT = "patient"


class EvaluationMethod(Enum):
    STRING_MATCH = "string_match"
    LLM_JUDGE = "llm_judge"
