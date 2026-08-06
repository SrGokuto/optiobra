from __future__ import annotations

import logging
from typing import Any

from app.domain.common.interfaces import AnalyzerPlugin, AnalysisResult

logger = logging.getLogger(__name__)


class PluginManager:
    """Discovers, executes, and merges results from all analyzer plugins."""

    def __init__(self) -> None:
        self._plugins: list[AnalyzerPlugin] = []

    def register(self, plugin: AnalyzerPlugin) -> None:
        self._plugins.append(plugin)
        logger.info("Registered analyzer plugin: %s", plugin.name)

    def register_all(self, plugins: list[AnalyzerPlugin]) -> None:
        for plugin in plugins:
            self.register(plugin)

    def execute(self, context: dict[str, Any]) -> dict[str, Any]:
        """Execute all plugins and merge results into a single analysis dict."""
        merged: dict[str, Any] = {}

        for plugin in self._plugins:
            try:
                result = plugin.analyze(context)
                merged[result.name] = {
                    "findings": result.findings,
                    "statistics": result.statistics,
                    "alerts": result.alerts,
                    "recommendations": result.recommendations,
                    "priority": result.priority,
                }
                logger.debug("Plugin %s completed successfully", plugin.name)
            except Exception:
                logger.exception("Plugin %s failed", plugin.name)

        all_recommendations = self._aggregate_recommendations(merged)
        all_alerts = self._aggregate_alerts(merged)

        merged["_summary"] = {
            "total_findings": len(merged),
            "total_recommendations": len(all_recommendations),
            "total_alerts": len(all_alerts),
            "high_priority_count": sum(
                1 for v in merged.values()
                if isinstance(v, dict) and v.get("priority") == "high"
            ),
        }

        return merged

    def _aggregate_recommendations(self, merged: dict[str, Any]) -> list[str]:
        recs: list[str] = []
        for key, value in merged.items():
            if key == "_summary" or not isinstance(value, dict):
                continue
            recs.extend(value.get("recommendations", []))
        return list(dict.fromkeys(recs))

    def _aggregate_alerts(self, merged: dict[str, Any]) -> list[dict[str, Any]]:
        alerts: list[dict[str, Any]] = []
        for key, value in merged.items():
            if key == "_summary" or not isinstance(value, dict):
                continue
            alerts.extend(value.get("alerts", []))
        return alerts
