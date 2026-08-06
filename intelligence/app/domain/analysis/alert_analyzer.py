from __future__ import annotations

from typing import Any

from app.domain.common.interfaces import AnalyzerPlugin, AnalysisResult
from app.config.thresholds import LOW_STOCK, HIGH_CONSUMPTION, DELAY_THRESHOLD


class AlertAnalyzer(AnalyzerPlugin):
    """Generates deterministic alerts based on thresholds."""

    @property
    def name(self) -> str:
        return "alert_analysis"

    def analyze(self, context: dict[str, Any]) -> AnalysisResult:
        project = context.get("project", {})
        materials = context.get("materials", [])
        activities = context.get("activities", [])

        alerts: list[dict[str, Any]] = []

        alerts.extend(self._check_material_alerts(materials))
        alerts.extend(self._check_project_alerts(project))
        alerts.extend(self._check_activity_alerts(activities))

        findings: dict[str, Any] = {
            "total_alerts": len(alerts),
            "high_severity": sum(1 for a in alerts if a.get("severity") == "high"),
            "medium_severity": sum(1 for a in alerts if a.get("severity") == "medium"),
            "low_severity": sum(1 for a in alerts if a.get("severity") == "low"),
        }

        statistics: dict[str, Any] = {
            "alert_count": len(alerts),
            "critical_alerts": sum(1 for a in alerts if a.get("severity") == "high"),
        }

        recommendations: list[str] = []
        if any(a["type"] == "LOW_STOCK" for a in alerts):
            recommendations.append("Se recomienda realizar pedidos de reposicion para materiales criticos")
        if any(a["type"] == "DELAY" for a in alerts):
            recommendations.append("Se recomienda evaluar el cronograma y posibles ajustes")

        return AnalysisResult(
            name=self.name,
            priority="high" if findings["high_severity"] > 0 else "medium",
            findings=findings,
            statistics=statistics,
            alerts=alerts,
            recommendations=recommendations,
        )

    def _check_material_alerts(self, materials: list[dict[str, Any]]) -> list[dict[str, Any]]:
        alerts: list[dict[str, Any]] = []
        for m in materials:
            curr = m.get("current_quantity", 0)
            prev = m.get("previous_quantity", 0)
            name = m.get("material", "Desconocido")

            if curr < LOW_STOCK:
                alerts.append({
                    "type": "LOW_STOCK",
                    "message": f"{name} por debajo del minimo ({curr} unidades)",
                    "severity": "high",
                })
            elif prev > 0 and abs(curr - prev) / prev > HIGH_CONSUMPTION:
                alerts.append({
                    "type": "EXCESSIVE_CONSUMPTION",
                    "message": f"{name} con consumo superior al {int(HIGH_CONSUMPTION * 100)}%",
                    "severity": "medium",
                })
        return alerts

    def _check_project_alerts(self, project: dict[str, Any]) -> list[dict[str, Any]]:
        alerts: list[dict[str, Any]] = []
        current = project.get("current_progress", 0)
        planned = project.get("planned_progress", 0)

        if planned > 0 and (planned - current) > DELAY_THRESHOLD:
            alerts.append({
                "type": "DELAY",
                "message": f"Proyecto con retraso: avance actual {current}%, planificado {planned}%",
                "severity": "high",
            })
        elif current < planned:
            alerts.append({
                "type": "DELAY",
                "message": f"Avance por debajo del planificado ({current}% vs {planned}%)",
                "severity": "medium",
            })
        return alerts

    def _check_activity_alerts(self, activities: list[dict[str, Any]]) -> list[dict[str, Any]]:
        alerts: list[dict[str, Any]] = []
        if not activities:
            alerts.append({
                "type": "NO_ACTIVITY",
                "message": "No se registraron actividades en el periodo evaluado",
                "severity": "medium",
            })
        return alerts
