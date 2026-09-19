from enum import Enum

__all__ = [
    "AttemptStatus",
    "EvaluationMethod",
    "MessageSender",
]

class AttemptStatus(Enum):
    IN_PROGRESS_HISTORY = "in_progress_history"
    HISTORY_COMPLETE = "history_complete"
    IN_PROGRESS_EXAMINATION = "in_progress_examination"
    EXAMINATION_COMPLETE = "examination_complete"
    SUMMARY_COMPLETE = "summary_complete"
    EVALUATED = "evaluated"


class MessageSender(Enum):
    STUDENT = "student"
    PATIENT = "patient"


class EvaluationMethod(Enum):
    STRING_MATCH = "string_match"
    LLM_JUDGE = "llm_judge"
