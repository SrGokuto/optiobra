from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ReportRequestDTO:
    """Data transfer object for report requests."""

    project: dict[str, Any]
    activities: list[dict[str, Any]] = field(default_factory=list)
    materials: list[dict[str, Any]] = field(default_factory=list)
    statistics: dict[str, Any] = field(default_factory=dict)
    alerts: list[dict[str, Any]] = field(default_factory=list)
    timeline: list[dict[str, Any]] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ReportResponseDTO:
    """Data transfer object for report responses."""

    success: bool = True
    report: str = ""
    model: str = ""
    duration_ms: int = 0
    prompt_tokens: int = 0
    completion_tokens: int = 0
