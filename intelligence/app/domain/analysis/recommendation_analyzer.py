from __future__ import annotations

from typing import Any

from app.domain.common.interfaces import AnalyzerPlugin, AnalysisResult


class RecommendationAnalyzer(AnalyzerPlugin):
    """Generates deterministic recommendations from findings."""

    @property
    def name(self) -> str:
        return "recommendation_analysis"

    def analyze(self, context: dict[str, Any]) -> AnalysisResult:
        project = context.get("project", {})
        materials = context.get("materials", [])
        activities = context.get("activities", [])

        recommendations: list[str] = []

        recommendations.extend(self._project_recommendations(project))
        recommendations.extend(self._material_recommendations(materials))
        recommendations.extend(self._activity_recommendations(activities))

        findings: dict[str, Any] = {
            "total_recommendations": len(recommendations),
        }

        return AnalysisResult(
            name=self.name,
            priority="low",
            findings=findings,
            statistics={"recommendation_count": len(recommendations)},
            alerts=[],
            recommendations=recommendations,
        )

    def _project_recommendations(self, project: dict[str, Any]) -> list[str]:
        recs: list[str] = []
        current = project.get("current_progress", 0)
        planned = project.get("planned_progress", 0)

        if current < planned - 10:
            recs.append("Se recomienda realizar una revision del cronograma de actividades")
        if current == 0 and project.get("start_date"):
            recs.append("Se recomienda verificar el inicio efectivo de las actividades")
        return recs

    def _material_recommendations(self, materials: list[dict[str, Any]]) -> list[str]:
        recs: list[str] = []
        critical = [m for m in materials if m.get("critical", False)]
        low_stock = [m for m in materials if m.get("current_quantity", 0) < 100]

        if critical:
            names = ", ".join(m.get("material", "") for m in critical[:3])
            recs.append(f"Se recomienda solicitar reposicion de: {names}")
        if low_stock and not critical:
            recs.append("Se recomienda revisar el inventario de materiales con stock bajo")
        return recs

    def _activity_recommendations(self, activities: list[dict[str, Any]]) -> list[str]:
        recs: list[str] = []
        if not activities:
            recs.append("Se recomienda registrar las actividades realizadas en el periodo")
        return recs
