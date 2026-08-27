from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class AssistantResponseDTO:
    """Data transfer object for assistant responses."""

    success: bool = True
    reply: str = ""
    model: str = ""
    duration_ms: int = 0
    materiales: list[dict[str, Any]] = field(default_factory=list)