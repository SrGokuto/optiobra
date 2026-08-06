from __future__ import annotations

from typing import Any

from app.domain.common.interfaces import AnalyzerPlugin, AnalysisResult
from app.config.thresholds import LOW_STOCK, HIGH_CONSUMPTION


class MaterialAnalyzer(AnalyzerPlugin):
    """Analyzes material consumption patterns, critical stock, and inventory health."""

    @property
    def name(self) -> str:
        return "material_analysis"

    def analyze(self, context: dict[str, Any]) -> AnalysisResult:
        materials = context.get("materials", [])

        total_materials = len(materials)
        critical_count = 0
        low_stock_count = 0
        high_consumption_count = 0
        material_details: list[dict[str, Any]] = []

        for m in materials:
            curr = m.get("current_quantity", 0)
            prev = m.get("previous_quantity", 0)
            diff = m.get("difference", curr - prev)
            is_critical = m.get("critical", False)

            if curr < LOW_STOCK:
                low_stock_count += 1
            if prev > 0 and abs(diff) / prev > HIGH_CONSUMPTION:
                high_consumption_count += 1
            if is_critical:
                critical_count += 1

            material_details.append({
                "name": m.get("material", ""),
                "current": curr,
                "previous": prev,
                "variation": diff,
                "is_critical": is_critical,
                "is_low_stock": curr < LOW_STOCK,
            })

        findings: dict[str, Any] = {
            "total_materials": total_materials,
            "critical_materials": critical_count,
            "low_stock_materials": low_stock_count,
            "high_consumption_materials": high_consumption_count,
            "details": material_details,
        }

        alerts: list[dict[str, Any]] = []
        for detail in material_details:
            if detail["is_low_stock"]:
                alerts.append({
                    "type": "LOW_STOCK",
                    "message": f"{detail['name']} por debajo del minimo ({detail['current']} unidades)",
                    "severity": "high",
                })
            elif detail["is_critical"]:
                alerts.append({
                    "type": "EXCESSIVE_CONSUMPTION",
                    "message": f"{detail['name']} con consumo elevado",
                    "severity": "medium",
                })

        recommendations: list[str] = []
        if low_stock_count > 0:
            recommendations.append("Se recomienda solicitar reposicion de materiales criticos")
        if high_consumption_count > 0:
            recommendations.append("Se recomienda revisar los registros de consumo de materiales")

        statistics = {
            "total_materials": total_materials,
            "critical_count": critical_count,
            "low_stock_count": low_stock_count,
            "consumption_alerts": high_consumption_count,
        }

        return AnalysisResult(
            name=self.name,
            priority="high" if critical_count > 0 else "low",
            findings=findings,
            statistics=statistics,
            alerts=alerts,
            recommendations=recommendations,
        )
