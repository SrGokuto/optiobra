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
        """Serialize context as a structured block for the prompt."""
        lines = ["## Contexto del Proyecto", ""]

        project = context.get("project", {})
        if project:
            lines.append("### Proyecto")
            lines.append(f"- Nombre: {project.get('name', 'N/A')}")
            lines.append(f"- Ubicacion: {project.get('location', 'N/A')}")
            lines.append(f"- Estado: {project.get('status', 'N/A')}")
            lines.append(f"- Avance actual: {project.get('current_progress', 0)}%")
            lines.append(f"- Avance planificado: {project.get('planned_progress', 0)}%")
            lines.append("")

        activities = context.get("activities", [])
        if activities:
            lines.append("### Actividades")
            for a in activities:
                date = a.get("date", "")
                name = a.get("activity", "")
                desc = (a.get("description") or "").strip()
                resp = a.get("responsible", "")
                status = a.get("status", "")
                priority = a.get("priority", "")

                header = name or "(sin titulo)"
                if date:
                    header = f"{date}: {header}"

                detalle = []
                if desc:
                    detalle.append(desc)
                if resp:
                    detalle.append(f"Responsable: {resp}")
                if status:
                    detalle.append(f"Estado: {status}")
                if priority:
                    detalle.append(f"Prioridad: {priority}")

                line = f"- {header}"
                if detalle:
                    line += f" - {' | '.join(detalle)}"
                lines.append(line)
            lines.append("")

        materials = context.get("materials", [])
        if materials:
            lines.append("### Materiales")
            for m in materials:
                mat_name = m.get("material", "")
                prev = m.get("previous_quantity", 0)
                curr = m.get("current_quantity", 0)
                diff = m.get("difference", 0)
                critical = "CRITICO" if m.get("critical", False) else "normal"
                lines.append(
                    f"- {mat_name}: {prev} -> {curr} (Variacion: {diff}, Estado: {critical})"
                )
            lines.append("")

        statistics = context.get("statistics", {})
        if statistics:
            lines.append("### Estadisticas")
            for k, v in statistics.items():
                lines.append(f"- {k}: {v}")
            lines.append("")

        alerts = context.get("alerts", [])
        if alerts:
            lines.append("### Alertas")
            for alert in alerts:
                lines.append(
                    f"- [{alert.get('type', '')}] {alert.get('message', '')} "
                    f"(Severidad: {alert.get('severity', 'medium')})"
                )
            lines.append("")

        timeline = context.get("timeline", [])
        if timeline:
            lines.append("### Cronologia")
            for t in timeline:
                lines.append(f"- {t.get('date', '')}: {t.get('event', '')}")
            lines.append("")

        return "\n".join(lines)
