from __future__ import annotations

import hashlib
import logging
import time
from typing import Any

logger = logging.getLogger(__name__)


class ResponseCache:
    """In-memory response cache with TTL."""

    def __init__(self, ttl: int = 600) -> None:
        self._cache: dict[str, tuple[float, Any]] = {}
        self._ttl = ttl

    def get(self, key: str) -> Any | None:
        """Get value from cache if not expired."""
        if key in self._cache:
            stored_time, value = self._cache[key]
            if time.monotonic() - stored_time < self._ttl:
                return value
            del self._cache[key]
        return None

    def set(self, key: str, value: Any) -> None:
        """Store value in cache."""
        self._cache[key] = (time.monotonic(), value)

    def clear(self) -> None:
        """Clear all cached entries."""
        self._cache.clear()

    def remove_expired(self) -> int:
        """Remove expired entries and return count removed."""
        now = time.monotonic()
        expired = [
            k for k, (t, _) in self._cache.items()
            if now - t >= self._ttl
        ]
        for k in expired:
            del self._cache[k]
        return len(expired)

    @staticmethod
    def hash_prompt(prompt: str) -> str:
        """Generate a hash key for a prompt."""
        return hashlib.sha256(prompt.encode()).hexdigest()

    @property
    def size(self) -> int:
        return len(self._cache)
