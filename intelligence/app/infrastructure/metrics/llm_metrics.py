from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class RequestMetrics:
    """Metrics for a single LLM request."""

    endpoint: str = ""
    model: str = ""
    provider: str = ""
    duration_ms: int = 0
    prompt_tokens: int = 0
    completion_tokens: int = 0
    cache_hit: bool = False
    temperature: float = 0.2
    success: bool = True
    error: str = ""


class LLMMetrics:
    """Collects and aggregates LLM metrics."""

    def __init__(self) -> None:
        self._requests: list[RequestMetrics] = []

    def record(self, metrics: RequestMetrics) -> None:
        """Record a request's metrics."""
        self._requests.append(metrics)
        logger.info(
            "LLM request: endpoint=%s model=%s duration=%dms tokens=%d/%d cache=%s",
            metrics.endpoint,
            metrics.model,
            metrics.duration_ms,
            metrics.prompt_tokens,
            metrics.completion_tokens,
            metrics.cache_hit,
        )

    def get_summary(self) -> dict[str, Any]:
        """Get aggregated metrics summary."""
        if not self._requests:
            return {"total_requests": 0}

        total = len(self._requests)
        successful = sum(1 for r in self._requests if r.success)
        cache_hits = sum(1 for r in self._requests if r.cache_hit)
        avg_duration = sum(r.duration_ms for r in self._requests) / total
        total_tokens = sum(
            r.prompt_tokens + r.completion_tokens for r in self._requests
        )

        return {
            "total_requests": total,
            "successful": successful,
            "failed": total - successful,
            "cache_hits": cache_hits,
            "cache_hit_rate": round(cache_hits / total * 100, 1) if total else 0,
            "avg_duration_ms": round(avg_duration),
            "total_tokens": total_tokens,
        }

    def clear(self) -> None:
        self._requests.clear()
