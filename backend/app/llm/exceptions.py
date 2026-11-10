class LLMError(Exception):
    """Provider call failed or returned an unusable reply."""


class LLMTimeoutError(LLMError):
    """Provider call exceeded the allowed time."""
