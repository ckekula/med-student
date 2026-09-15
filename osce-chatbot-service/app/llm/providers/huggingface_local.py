from functools import lru_cache

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_huggingface import ChatHuggingFace, HuggingFacePipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

from app.config import get_settings
from app.llm.base import ChatProvider

settings = get_settings()


@lru_cache(maxsize=2)  # keep at most 2 local models resident at once (GPU memory permitting)
def _load_pipeline(model_name: str, max_new_tokens: int):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name, device_map=settings.HF_DEVICE)
    pipe = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        max_new_tokens=max_new_tokens,
        do_sample=True,
        temperature=0.7,
        return_full_text=False,
    )
    return HuggingFacePipeline(pipeline=pipe)


class HuggingFaceLocalProvider(ChatProvider):
    """Runs Sinhala-specific open models locally via `transformers`.

    NOTE: model loading is heavy and blocking. `_load_pipeline` is cached so repeated
    requests for the same model reuse the resident weights instead of reloading per-call.
    For real concurrent traffic, move loading into a startup hook / background worker
    instead of lazy-loading on first request.
    """

    provider_name = "hf_local"

    def build(self, model_name: str, **kwargs) -> BaseChatModel:
        max_new_tokens = kwargs.pop("max_new_tokens", 512)
        llm = _load_pipeline(model_name, max_new_tokens)
        return ChatHuggingFace(llm=llm)
