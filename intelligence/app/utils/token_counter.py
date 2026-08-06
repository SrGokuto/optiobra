from __future__ import annotations


def estimate_tokens(text: str) -> int:
    """Estimate token count for text.

    Approximation: ~1 token per 4 characters for Spanish text.
    This is a rough estimate; use tiktoken for precise counts.
    """
    return max(1, len(text) // 4)


def estimate_context_usage(prompt: str, max_context: int = 4096) -> float:
    """Estimate what percentage of context window is used."""
    tokens = estimate_tokens(prompt)
    return round(tokens / max_context * 100, 1)
