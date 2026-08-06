from __future__ import annotations

from typing import Any

from app.domain.common.interfaces import AnalyzerPlugin, AnalysisResult
from app.domain.common.types import Trend
from app.config.thresholds import STAGNATION_DAYS


class ProgressAnalyzer(AnalyzerPlugin):
    """Analyzes progress trends, stagnation, acceleration, and regression."""

    @property
    def name(self) -> str:
        return "progress_analysis"

    def analyze(self, context: dict[str, Any]) -> AnalysisResult:
        activities = context.get("activities", [])
        project = context.get("project", {})

        progress_values = [a.get("progress_after", 0) for a in activities if a.get("progress_after")]
        trend = self._calculate_trend(progress_values)
        stagnation = self._detect_stagnation(progress_values)

        current = project.get("current_progress", 0)
        planned = project.get("planned_progress", 0)

        findings: dict[str, Any] = {
            "trend": trend,
            "is_stagnant": stagnation["stagnant"],
            "stagnation_days": stagnation.get("days", 0),
            "current_progress": current,
            "planned_progress": planned,
            "progress_data_points": len(progress_values),
        }

        statistics: dict[str, Any] = {
            "trend": trend,
            "stagnation_detected": stagnation["stagnant"],
            "data_points": len(progress_values),
        }

        if progress_values:
            statistics["min_progress"] = min(progress_values)
            statistics["max_progress"] = max(progress_values)
            statistics["progress_range"] = max(progress_values) - min(progress_values)

        recommendations: list[str] = []
        if trend == Trend.NEGATIVE:
            recommendations.append("Se recomienda analizar las causas del retroceso en el avance")
        if stagnation["stagnant"]:
            recommendations.append(
                f"Se recomienda revisar la falta de avance ({stagnation.get('days', 0)} dias sin cambio)"
            )
        if current < planned - 5:
            recommendations.append("Se recomienda evaluar acciones correctivas para alcanzar la meta")

        return AnalysisResult(
            name=self.name,
            priority="high" if trend == Trend.NEGATIVE or stagnation["stagnant"] else "low",
            findings=findings,
            statistics=statistics,
            alerts=[],
            recommendations=recommendations,
        )

    def _calculate_trend(self, values: list[int]) -> str:
        if len(values) < 2:
            return Trend.STABLE
        first_half = values[: len(values) // 2]
        second_half = values[len(values) // 2:]
        avg_first = sum(first_half) / len(first_half) if first_half else 0
        avg_second = sum(second_half) / len(second_half) if second_half else 0
        diff = avg_second - avg_first
        if diff > 1:
            return Trend.POSITIVE
        elif diff < -1:
            return Trend.NEGATIVE
        return Trend.STABLE

    def _detect_stagnation(self, values: list[int]) -> dict[str, Any]:
        if len(values) < 2:
            return {"stagnant": False, "days": 0}
        consecutive_same = 0
        last_value = values[-1]
        for v in reversed(values[:-1]):
            if v == last_value:
                consecutive_same += 1
            else:
                break
        return {
            "stagnant": consecutive_same >= STAGNATION_DAYS,
            "days": consecutive_same,
        }
