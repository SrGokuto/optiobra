from __future__ import annotations

import logging
import time

import httpx

from app.domain.common.interfaces import LLMProvider, LLMResponse, HealthStatus, ModelInfo
from app.config.settings import load_model_config

logger = logging.getLogger(__name__)


class LlamaCppProvider(LLMProvider):
    """HTTP client for llama.cpp server."""

    def __init__(
        self,
        base_url: str = "http://localhost:8080",
        timeout: int = 30,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._client = httpx.AsyncClient(timeout=timeout)
        self._config = load_model_config()

    async def generate(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 1200,
    ) -> LLMResponse:
        """Send prompt to llama.cpp server and return response."""
        params = self._config.get("parameters", {})
        payload = {
            "model": self._config.get("model", "default"),
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "top_p": params.get("top_p", 0.9),
            "top_k": params.get("top_k", 40),
            "repeat_penalty": params.get("repeat_penalty", 1.1),
            "max_tokens": max_tokens,
            "stream": False,
        }

        start = time.monotonic()
        try:
            response = await self._client.post(
                f"{self._base_url}/v1/chat/completions",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            duration_ms = int((time.monotonic() - start) * 1000)

            choice = data.get("choices", [{}])[0]
            text = choice.get("message", {}).get("content", "")
            usage = data.get("usage", {})

            return LLMResponse(
                text=text,
                prompt_tokens=usage.get("prompt_tokens", 0),
                completion_tokens=usage.get("completion_tokens", 0),
                duration_ms=duration_ms,
                model=data.get("model", self._config.get("model", "unknown")),
            )

        except httpx.TimeoutException:
            logger.error("LLM request timed out after %ds", self._timeout)
            raise
        except httpx.HTTPStatusError as e:
            logger.error("LLM server error: %s", e.response.status_code)
            raise
        except Exception as e:
            logger.error("LLM request failed: %s", str(e))
            raise

    async def health(self) -> HealthStatus:
        """Check llama.cpp server health."""
        start = time.monotonic()
        try:
            response = await self._client.get(f"{self._base_url}/health")
            response.raise_for_status()
            response_time = int((time.monotonic() - start) * 1000)
            return HealthStatus(
                available=True,
                model_loaded=True,
                response_time_ms=response_time,
                message="OK",
            )
        except Exception as e:
            return HealthStatus(
                available=False,
                model_loaded=False,
                message=str(e),
            )

    async def model_info(self) -> ModelInfo:
        """Get model information from config."""
        return ModelInfo(
            name=self._config.get("model", "unknown"),
            quantization=self._config.get("quantization", ""),
            backend=self._config.get("backend", "llama.cpp"),
            context_size=self._config.get("infrastructure", {}).get("context_size", 4096),
        )

    def token_count(self, text: str) -> int:
        """Estimate token count (approximate: ~4 chars per token for Spanish)."""
        return len(text) // 4

    async def close(self) -> None:
        """Close the HTTP client."""
        await self._client.aclose()
