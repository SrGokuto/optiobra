from __future__ import annotations

from typing import Any

from app.domain.common.interfaces import AnalyzerPlugin, AnalysisResult


class ProjectAnalyzer(AnalyzerPlugin):
    """Analyzes project state, schedule deviation, and overall health."""

    @property
    def name(self) -> str:
        return "project_analysis"

    def analyze(self, context: dict[str, Any]) -> AnalysisResult:
        project = context.get("project", {})
        activities = context.get("activities", [])

        current = project.get("current_progress", 0)
        planned = project.get("planned_progress", 0)
        deviation = current - planned

        findings: dict[str, Any] = {
            "current_progress": current,
            "planned_progress": planned,
            "deviation": deviation,
            "status": project.get("status", ""),
            "is_behind_schedule": deviation < -5,
            "is_ahead_of_schedule": deviation > 5,
        }

        recommendations: list[str] = []
        if deviation < -10:
            recommendations.append("Se recomienda evaluar las causas del retraso y ajustar el cronograma")
        elif deviation < -5:
            recommendations.append("Se recomienda monitorear el avance semanalmente")
        if not activities:
            recommendations.append("Se recomienda registrar actividades para tener un mejor seguimiento")

        return AnalysisResult(
            name=self.name,
            priority="high" if deviation < -10 else "medium",
            findings=findings,
            statistics={
                "schedule_deviation": deviation,
                "progress_ratio": round(current / planned, 2) if planned > 0 else 0,
            },
            alerts=[],
            recommendations=recommendations,
        )
