from __future__ import annotations

import time
import logging

from app.domain.common.interfaces import LLMProvider

logger = logging.getLogger(__name__)

_start_time = time.monotonic()


class HealthService:
    """Health and info checks for the intelligence engine."""

    def __init__(self, provider: LLMProvider, version: str = "1.0.0") -> None:
        self._provider = provider
        self._version = version

    def get_uptime(self) -> float:
        return time.monotonic() - _start_time

    async def check_health(self) -> dict:
        """Full health check including LLM provider."""
        try:
            status = await self._provider.health()
            return {
                "status": "healthy" if status.available else "degraded",
                "version": self._version,
                "uptime_seconds": self.get_uptime(),
                "llm": {
                    "available": status.available,
                    "model_loaded": status.model_loaded,
                    "response_time_ms": status.response_time_ms,
                },
            }
        except Exception as e:
            logger.error("Health check failed: %s", str(e))
            return {
                "status": "unhealthy",
                "version": self._version,
                "uptime_seconds": self.get_uptime(),
                "llm": {"available": False, "error": str(e)},
            }

    async def get_info(self) -> dict:
        """Get engine information."""
        try:
            info = await self._provider.model_info()
            return {
                "version": self._version,
                "model": info.name,
                "provider": type(self._provider).__name__,
                "uptime_seconds": self.get_uptime(),
            }
        except Exception:
            return {
                "version": self._version,
                "model": "unknown",
                "provider": type(self._provider).__name__,
                "uptime_seconds": self.get_uptime(),
            }
