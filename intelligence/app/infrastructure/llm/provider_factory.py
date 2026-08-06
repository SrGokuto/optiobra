from __future__ import annotations

import logging

from app.domain.common.interfaces import LLMProvider
from app.config.settings import get_settings

logger = logging.getLogger(__name__)


def create_provider() -> LLMProvider:
    """Factory function to create the appropriate LLM provider."""
    settings = get_settings()

    if settings.USE_MOCK:
        logger.info("Using MockProvider")
        from app.infrastructure.llm.mock_provider import MockProvider
        return MockProvider()

    logger.info("Using LlamaCppProvider (url=%s)", settings.LLAMA_CPP_URL)
    from app.infrastructure.llm.llama_cpp_provider import LlamaCppProvider
    return LlamaCppProvider(
        base_url=settings.LLAMA_CPP_URL,
        timeout=settings.REQUEST_TIMEOUT,
    )
