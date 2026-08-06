from __future__ import annotations

import hashlib
import logging
import time
from typing import Any

from app.domain.common.interfaces import LLMProvider, LLMResponse

logger = logging.getLogger(__name__)


class LLMService:
    """Wraps LLM provider with cache, retries, and metrics."""

    def __init__(
        self,
        provider: LLMProvider,
        cache_ttl: int = 600,
        request_timeout: int = 30,
        max_retries: int = 1,
    ) -> None:
        self._provider = provider
        self._cache: dict[str, tuple[float, LLMResponse]] = {}
        self._cache_ttl = cache_ttl
        self._request_timeout = request_timeout
        self._max_retries = max_retries

    async def generate(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 1200,
    ) -> tuple[LLMResponse, dict[str, Any]]:
        """Generate a response with caching and retry logic.

        Returns the response and metrics dict.
        """
        metrics: dict[str, Any] = {
            "cache_hit": False,
            "provider": type(self._provider).__name__,
            "model": "",
            "retries": 0,
        }

        cached = self._get_from_cache(prompt)
        if cached:
            metrics["cache_hit"] = True
            logger.info("Cache hit for prompt (hash=%s)", self._hash_prompt(prompt)[:8])
            return cached, metrics

        start = time.monotonic()
        last_error: Exception | None = None

        for attempt in range(self._max_retries + 1):
            try:
                response = await self._provider.generate(
                    prompt=prompt,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                response.duration_ms = int((time.monotonic() - start) * 1000)
                metrics["model"] = response.model

                self._store_in_cache(prompt, response)

                logger.info(
                    "LLM response: %dms, %d prompt_tokens, %d completion_tokens",
                    response.duration_ms,
                    response.prompt_tokens,
                    response.completion_tokens,
                )
                return response, metrics

            except Exception as e:
                last_error = e
                metrics["retries"] = attempt + 1
                logger.warning(
                    "LLM attempt %d failed: %s", attempt + 1, str(e)
                )

        raise last_error or RuntimeError("LLM generation failed")

    def _hash_prompt(self, prompt: str) -> str:
        return hashlib.sha256(prompt.encode()).hexdigest()

    def _get_from_cache(self, prompt: str) -> LLMResponse | None:
        key = self._hash_prompt(prompt)
        if key in self._cache:
            stored_time, response = self._cache[key]
            if time.monotonic() - stored_time < self._cache_ttl:
                return response
            del self._cache[key]
        return None

    def _store_in_cache(self, prompt: str, response: LLMResponse) -> None:
        key = self._hash_prompt(prompt)
        self._cache[key] = (time.monotonic(), response)

    def clear_cache(self) -> None:
        self._cache.clear()
