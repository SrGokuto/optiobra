from __future__ import annotations

import logging
import re

logger = logging.getLogger(__name__)

MAX_WORDS = {
    "executive": 600,
    "daily": 400,
    "weekly": 800,
    "monthly": 1200,
}

REQUIRED_HEADINGS = {
    "executive": ["Resumen Ejecutivo"],
    "daily": ["Resumen"],
    "weekly": ["Resumen"],
    "monthly": ["Estado General"],
}


class MarkdownService:
    """Validates LLM output is proper Markdown."""

    def validate(self, text: str, report_type: str = "executive") -> str:
        """Validate and return the report text, raising on failure."""
        if not text or not text.strip():
            raise ValueError("Empty report generated")

        if "<html" in text.lower() or "<div" in text.lower():
            raise ValueError("Report contains HTML tags")

        text = self._truncate_repeated_blocks(text)

        word_count = len(text.split())
        max_words = MAX_WORDS.get(report_type, 600)
        if word_count > max_words * 1.2:
            logger.warning(
                "Report exceeds word limit: %d words (max %d)",
                word_count,
                max_words,
            )

        headings = REQUIRED_HEADINGS.get(report_type, [])
        for heading in headings:
            if heading.lower() not in text.lower():
                logger.warning("Expected heading '%s' not found in report", heading)

        return text.strip()

    def _truncate_repeated_blocks(self, text: str) -> str:
        """Cut the report at the first repeated content block.

        Small LLMs often loop, repeating the tail sections verbatim (e.g.
        three times the same Observaciones/Recomendaciones/Conclusión).
        Exact duplicated blocks are almost always an artifact of such loops,
        so the report is truncated at the first repetition.
        """
        blocks = [b.strip() for b in re.split(r"\n\s*\n", text.strip()) if b.strip()]
        seen: set[str] = set()
        output: list[str] = []
        for block in blocks:
            key = self._normalize_block(block)
            if key in seen:
                logger.warning(
                    "Repeated block detected (%d chars), truncating report",
                    len(block),
                )
                break
            seen.add(key)
            output.append(block)
        return "\n\n".join(output).strip()

    def _normalize_block(self, block: str) -> str:
        """Normalize a block for duplicate detection, ignoring Markdown syntax."""
        lines = []
        for line in block.splitlines():
            stripped = line.strip()
            stripped = re.sub(r"^#{1,6}\s*", "", stripped)
            stripped = re.sub(r"\*\*|__|`", "", stripped)
            lines.append(stripped)
        return "\n".join(lines).lower()
