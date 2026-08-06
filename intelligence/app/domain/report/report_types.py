from __future__ import annotations

from typing import Any


class EnrichedContext:
    """Context after enrichment pipeline processing."""

    def __init__(
        self,
        project: dict[str, Any],
        activities: list[dict[str, Any]],
        materials: list[dict[str, Any]],
        statistics: dict[str, Any],
        alerts: list[dict[str, Any]],
        timeline: list[dict[str, Any]],
        analysis: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self.project = project
        self.activities = activities
        self.materials = materials
        self.statistics = statistics
        self.alerts = alerts
        self.timeline = timeline
        self.analysis = analysis or {}
        self.metadata = metadata or {}

    def to_dict(self) -> dict[str, Any]:
        return {
            "project": self.project,
            "activities": self.activities,
            "materials": self.materials,
            "statistics": self.statistics,
            "alerts": self.alerts,
            "timeline": self.timeline,
            "analysis": self.analysis,
            "metadata": self.metadata,
        }
