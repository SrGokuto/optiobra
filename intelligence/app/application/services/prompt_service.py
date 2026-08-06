from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, TemplateNotFound

from app.config.settings import BASE_DIR

logger = logging.getLogger(__name__)

PROMPTS_DIR = BASE_DIR / "prompts"

BLOCK_ORDER = ["system", "role", "task", "rules", "context", "output"]

ROLE_MAP = {
    "executive": "construction_engineer.md",
    "daily": "site_manager.md",
    "weekly": "project_manager.md",
    "monthly": "project_manager.md",
}

TASK_MAP = {
    "executive": "executive.md",
    "daily": "daily.md",
    "weekly": "weekly.md",
    "monthly": "monthly.md",
}


class PromptService:
    """Builds prompts from Jinja2 templates.

    Assembly order: System -> Role -> Task -> Rules -> Context -> Output
    """

    def __init__(self) -> None:
        self._env = Environment(
            loader=FileSystemLoader(str(PROMPTS_DIR)),
            trim_blocks=True,
            lstrip_blocks=True,
        )

    def build(self, report_type: str, context: dict[str, Any]) -> str:
        """Assemble a complete prompt from template blocks."""
        blocks: list[str] = []

        system_block = self._load_template("system/system.md")
        if system_block:
            blocks.append(system_block)

        safety_block = self._load_template("system/safety.md")
        if safety_block:
            blocks.append(safety_block)

        role_file = ROLE_MAP.get(report_type, ROLE_MAP["executive"])
        role_block = self._load_template(f"roles/{role_file}")
        if role_block:
            blocks.append(role_block)

        task_file = TASK_MAP.get(report_type, TASK_MAP["executive"])
        task_block = self._load_template(f"tasks/{task_file}")
        if task_block:
            blocks.append(task_block)

        for rule_file in ["general.md", "anti_hallucination.md", "style.md"]:
            rule_block = self._load_template(f"rules/{rule_file}")
            if rule_block:
                blocks.append(rule_block)

        context_block = self._format_context(context)
        blocks.append(context_block)

        output_block = self._load_template("output/markdown.md")
        if output_block:
            blocks.append(output_block)

        prompt = "\n\n".join(blocks)
        logger.info(
            "Prompt built for report_type=%s, length=%d chars",
            report_type,
            len(prompt),
        )
        return prompt

    def _load_template(self, relative_path: str) -> str | None:
        try:
            template = self._env.get_template(relative_path)
            return template.render().strip()
        except TemplateNotFound:
            logger.warning("Template not found: %s", relative_path)
            return None

    def _format_context(self, context: dict[str, Any]) -> str:
        """Serialize context as a compact block for the prompt."""
        lines = ["CONTEXTO:", ""]

        project = context.get("project", {})
        if project:
            lines.append(
                f"Proyecto: {project.get('name', '')} | {project.get('location', '')} | "
                f"Estado: {project.get('status', '')} | Avance: {project.get('current_progress', 0)}%/{project.get('planned_progress', 0)}%"
            )

        activities = context.get("activities", [])
        if activities:
            lines.append(f"Actividades ({len(activities)}):")
            for a in activities[:10]:
                lines.append(
                    f"- {a.get('date', '')} {a.get('activity', '')}: "
                    f"{a.get('progress_before', 0)}%->{a.get('progress_after', 0)}%"
                )

        materials = context.get("materials", [])
        if materials:
            lines.append(f"Materiales ({len(materials)}):")
            for m in materials:
                crit = "CRITICO" if m.get("critical", False) else ""
                lines.append(
                    f"- {m.get('material', '')}: {m.get('current_quantity', 0)} "
                    f"(cambio: {m.get('difference', 0)}) {crit}"
                )

        statistics = context.get("statistics", {})
        if statistics:
            lines.append(f"Estadisticas: act={statistics.get('activities_count',0)} mat={statistics.get('material_changes',0)} crit={statistics.get('critical_materials',0)} avance={statistics.get('total_progress',0)}%")

        alerts = context.get("alerts", [])
        if alerts:
            lines.append("Alertas:")
            for a in alerts[:5]:
                lines.append(f"- {a.get('type', '')}: {a.get('message', '')}")

        analysis = context.get("analysis", {})
        if analysis:
            recs = []
            for data in analysis.values():
                if isinstance(data, dict):
                    recs.extend(data.get("recommendations", []))
            if recs:
                lines.append("Recomendaciones calculadas:")
                for r in recs[:5]:
                    lines.append(f"- {r}")

        return "\n".join(lines)
