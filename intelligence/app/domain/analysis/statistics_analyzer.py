from __future__ import annotations

from typing import Any

from app.domain.common.interfaces import AnalyzerPlugin, AnalysisResult


class StatisticsAnalyzer(AnalyzerPlugin):
    """Calculates deterministic statistics from raw data."""

    @property
    def name(self) -> str:
        return "statistics_analysis"

    def analyze(self, context: dict[str, Any]) -> AnalysisResult:
        activities = context.get("activities", [])
        materials = context.get("materials", [])
        project = context.get("project", {})
        statistics = context.get("statistics", {})

        activity_stats = self._analyze_activities(activities)
        material_stats = self._analyze_materials(materials)
        progress_stats = self._analyze_progress(project, activities)

        all_statistics = {**statistics, **activity_stats, **material_stats, **progress_stats}

        findings: dict[str, Any] = {
            "activity_summary": activity_stats,
            "material_summary": material_stats,
            "progress_summary": progress_stats,
        }

        return AnalysisResult(
            name=self.name,
            priority="low",
            findings=findings,
            statistics=all_statistics,
            alerts=[],
            recommendations=[],
        )

    def _analyze_activities(self, activities: list[dict[str, Any]]) -> dict[str, Any]:
        if not activities:
            return {"total": 0, "with_description": 0}

        with_desc = sum(1 for a in activities if a.get("description"))
        responsible_set = {a.get("responsible", "") for a in activities if a.get("responsible")}

        return {
            "total": len(activities),
            "with_description": with_desc,
            "unique_responsibles": len(responsible_set),
        }

    def _analyze_materials(self, materials: list[dict[str, Any]]) -> dict[str, Any]:
        if not materials:
            return {"total": 0, "critical": 0, "total_variation": 0}

        critical = sum(1 for m in materials if m.get("critical", False))
        total_variation = sum(abs(m.get("difference", 0)) for m in materials)
        categories = {m.get("category", "") for m in materials if m.get("category")}

        return {
            "total": len(materials),
            "critical": critical,
            "total_variation": total_variation,
            "unique_categories": len(categories),
        }

    def _analyze_progress(
        self,
        project: dict[str, Any],
        activities: list[dict[str, Any]],
    ) -> dict[str, Any]:
        current = project.get("current_progress", 0)
        planned = project.get("planned_progress", 0)

        progress_values = [a.get("progress_after", 0) for a in activities if a.get("progress_after")]

        result: dict[str, Any] = {
            "current_progress": current,
            "planned_progress": planned,
            "deviation": current - planned,
        }

        if progress_values:
            result["avg_activity_progress"] = round(
                sum(progress_values) / len(progress_values), 1
            )
            result["max_activity_progress"] = max(progress_values)
            result["min_activity_progress"] = min(progress_values)

        return result
