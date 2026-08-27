from __future__ import annotations

from dataclasses import dataclass


@dataclass
class AssistantResponseDTO:
    """Data transfer object for assistant responses."""

    success: bool = True
    reply: str = ""
    model: str = ""
    duration_ms: int = 0