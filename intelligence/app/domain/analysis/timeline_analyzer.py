from __future__ import annotations

from typing import Any

from app.domain.common.interfaces import AnalyzerPlugin, AnalysisResult


class TimelineAnalyzer(AnalyzerPlugin):
    """Orders events chronologically, groups activities, and builds project history."""

    @property
    def name(self) -> str:
        return "timeline_analysis"

    def analyze(self, context: dict[str, Any]) -> AnalysisResult:
        activities = context.get("activities", [])
        materials = context.get("materials", [])
        timeline = context.get("timeline", [])

        all_events = list(timeline)

        for a in activities:
            all_events.append({
                "date": a.get("date", ""),
                "event": a.get("activity", ""),
                "type": "activity",
            })

        for m in materials:
            if m.get("difference", 0) != 0:
                all_events.append({
                    "date": "",
                    "event": f"Cambio en {m.get('material', '')}",
                    "type": "material",
                })

        all_events.sort(key=lambda x: x.get("date", ""))

        unique_events = self._remove_duplicates(all_events)

        activity_count = sum(1 for e in unique_events if e.get("type") == "activity")
        material_count = sum(1 for e in unique_events if e.get("type") == "material")

        findings: dict[str, Any] = {
            "total_events": len(unique_events),
            "activity_events": activity_count,
            "material_events": material_count,
            "date_range": self._get_date_range(unique_events),
        }

        statistics: dict[str, Any] = {
            "event_count": len(unique_events),
            "activity_count": activity_count,
            "material_count": material_count,
        }

        return AnalysisResult(
            name=self.name,
            priority="low",
            findings=findings,
            statistics=statistics,
            alerts=[],
            recommendations=[],
        )

    def _remove_duplicates(self, events: list[dict[str, Any]]) -> list[dict[str, Any]]:
        seen: set[str] = set()
        unique: list[dict[str, Any]] = []
        for event in events:
            key = f"{event.get('date', '')}-{event.get('event', '')}"
            if key not in seen:
                seen.add(key)
                unique.append(event)
        return unique

    def _get_date_range(self, events: list[dict[str, Any]]) -> dict[str, str]:
        dates = [e.get("date", "") for e in events if e.get("date")]
        if not dates:
            return {"start": "", "end": ""}
        return {"start": min(dates), "end": max(dates)}
