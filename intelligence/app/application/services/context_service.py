from __future__ import annotations

import json
import logging
from typing import Any

from app.schemas.request import ReportRequest
from app.domain.report.report_types import EnrichedContext

logger = logging.getLogger(__name__)


class ContextService:
    """Transforms raw request JSON into enriched context.

    Runs the full enrichment pipeline:
    validation -> normalization -> analysis -> statistics -> alerts -> timeline -> summary -> optimization
    """

    def __init__(self) -> None:
        self._analyzers: list[Any] = []

    def register_analyzer(self, analyzer: Any) -> None:
        self._analyzers.append(analyzer)

    def enrich(self, request: ReportRequest) -> EnrichedContext:
        """Run the enrichment pipeline and return enriched context."""
        raw = request.model_dump()

        project = self._normalize_project(raw["project"])
        activities = self._normalize_activities(raw.get("activities", []))
        materials = self._normalize_materials(raw.get("materials", []))

        statistics = self._compute_statistics(
            project, activities, materials, raw.get("statistics", {})
        )

        alerts = self._generate_alerts(project, materials, activities)
        alerts.extend(self._convert_raw_alerts(raw.get("alerts", [])))

        timeline = self._build_timeline(activities, materials)
        timeline.extend(self._convert_raw_timeline(raw.get("timeline", [])))

        analysis = self._run_analyzers(project, activities, materials, statistics, alerts)

        summary = self._build_summary(activities, materials, statistics)

        metadata = raw.get("metadata", {})

        enriched = EnrichedContext(
            project=project,
            activities=activities,
            materials=materials,
            statistics=statistics,
            alerts=alerts,
            timeline=timeline,
            analysis=analysis,
            metadata=metadata,
        )

        logger.info(
            "Context enriched: %d activities, %d materials, %d alerts, %d timeline events",
            len(activities),
            len(materials),
            len(alerts),
            len(timeline),
        )
        return enriched

    def _normalize_project(self, data: dict[str, Any]) -> dict[str, Any]:
        return {
            "name": data.get("name", ""),
            "location": data.get("location", ""),
            "status": data.get("status", ""),
            "current_progress": data.get("current_progress", 0),
            "planned_progress": data.get("planned_progress", 0),
            "start_date": data.get("start_date", ""),
            "estimated_finish": data.get("estimated_finish", ""),
            "last_update": data.get("last_update", ""),
        }

    def _normalize_activities(self, activities: list[dict[str, Any]]) -> list[dict[str, Any]]:
        normalized = []
        for a in activities:
            normalized.append({
                "date": a.get("date", ""),
                "activity": a.get("activity", ""),
                "description": a.get("description", ""),
                "responsible": a.get("responsible", ""),
                "progress_before": a.get("progress_before", 0),
                "progress_after": a.get("progress_after", 0),
            })
        normalized.sort(key=lambda x: x.get("date", ""))
        return normalized

    def _normalize_materials(self, materials: list[dict[str, Any]]) -> list[dict[str, Any]]:
        normalized = []
        for m in materials:
            prev = m.get("previous_quantity", 0)
            curr = m.get("current_quantity", 0)
            diff = curr - prev
            critical = m.get("critical", False)
            if not critical and prev > 0:
                consumption_rate = abs(diff) / prev if prev > 0 else 0
                critical = consumption_rate > 0.30
            normalized.append({
                "material": m.get("material", ""),
                "category": m.get("category", ""),
                "previous_quantity": prev,
                "current_quantity": curr,
                "difference": diff,
                "critical": critical,
            })
        return normalized

    def _compute_statistics(
        self,
        project: dict[str, Any],
        activities: list[dict[str, Any]],
        materials: list[dict[str, Any]],
        raw_stats: dict[str, Any],
    ) -> dict[str, Any]:
        stats = {
            "activities_count": raw_stats.get("activities_count", len(activities)),
            "material_changes": raw_stats.get("material_changes", len(materials)),
            "critical_materials": raw_stats.get(
                "critical_materials",
                sum(1 for m in materials if m.get("critical", False)),
            ),
            "average_progress": raw_stats.get("average_progress", 0.0),
            "total_progress": raw_stats.get(
                "total_progress", project.get("current_progress", 0)
            ),
        }

        if activities and stats["average_progress"] == 0.0:
            progresses = [
                a.get("progress_after", 0) for a in activities if a.get("progress_after")
            ]
            if progresses:
                stats["average_progress"] = round(sum(progresses) / len(progresses), 1)

        return stats

    def _generate_alerts(
        self,
        project: dict[str, Any],
        materials: list[dict[str, Any]],
        activities: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        alerts: list[dict[str, Any]] = []

        for m in materials:
            if m.get("critical", False):
                alerts.append({
                    "type": "LOW_STOCK" if m.get("current_quantity", 0) < 100 else "EXCESSIVE_CONSUMPTION",
                    "message": f"{m['material']} - consumo elevado detectado",
                    "severity": "high",
                })

        current = project.get("current_progress", 0)
        planned = project.get("planned_progress", 0)
        if planned > 0 and current < planned - 10:
            alerts.append({
                "type": "DELAY",
                "message": f"Avance actual ({current}%) por debajo del planificado ({planned}%)",
                "severity": "high",
            })

        if not activities:
            alerts.append({
                "type": "NO_ACTIVITY",
                "message": "No se registraron actividades en el periodo",
                "severity": "medium",
            })

        return alerts

    def _convert_raw_alerts(self, raw_alerts: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return [
            {
                "type": a.get("type", "MISSING_INFORMATION"),
                "message": a.get("message", ""),
                "severity": a.get("severity", "medium"),
            }
            for a in raw_alerts
        ]

    def _build_timeline(
        self,
        activities: list[dict[str, Any]],
        materials: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        events: list[dict[str, Any]] = []

        for a in activities:
            events.append({
                "date": a.get("date", ""),
                "event": a.get("activity", ""),
                "type": "activity",
            })

        for m in materials:
            if m.get("difference", 0) != 0:
                events.append({
                    "date": "",
                    "event": f"Cambio en {m['material']}: {m['difference']}",
                    "type": "material",
                })

        events.sort(key=lambda x: x.get("date", ""))
        return events

    def _convert_raw_timeline(self, raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return [
            {
                "date": t.get("date", ""),
                "event": t.get("event", ""),
                "type": t.get("type", "event"),
            }
            for t in raw
        ]

    def _run_analyzers(
        self,
        project: dict[str, Any],
        activities: list[dict[str, Any]],
        materials: list[dict[str, Any]],
        statistics: dict[str, Any],
        alerts: list[dict[str, Any]],
    ) -> dict[str, Any]:
        context = {
            "project": project,
            "activities": activities,
            "materials": materials,
            "statistics": statistics,
            "alerts": alerts,
        }

        analysis: dict[str, Any] = {}
        for analyzer in self._analyzers:
            try:
                result = analyzer.analyze(context)
                analysis[result.name] = {
                    "findings": result.findings,
                    "statistics": result.statistics,
                    "alerts": result.alerts,
                    "recommendations": result.recommendations,
                }
            except Exception:
                logger.exception("Analyzer %s failed", getattr(analyzer, "name", "unknown"))

        return analysis

    def _build_summary(
        self,
        activities: list[dict[str, Any]],
        materials: list[dict[str, Any]],
        statistics: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "activities_summary": {
                "total": statistics.get("activities_count", len(activities)),
            },
            "materials_summary": {
                "total": len(materials),
                "critical": statistics.get("critical_materials", 0),
            },
            "progress_summary": {
                "current": statistics.get("total_progress", 0),
                "average": statistics.get("average_progress", 0.0),
            },
        }
