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
