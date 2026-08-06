from __future__ import annotations

import re


def is_valid_markdown(text: str) -> bool:
    """Check if text appears to be valid Markdown."""
    if not text or not text.strip():
        return False
    if "<html" in text.lower():
        return False
    return True


def has_expected_headings(text: str, headings: list[str]) -> list[str]:
    """Check which expected headings are present in the text."""
    found: list[str] = []
    for heading in headings:
        pattern = rf"^#+\s+{re.escape(heading)}" if not heading.startswith("#") else re.escape(heading)
        if re.search(pattern, text, re.MULTILINE | re.IGNORECASE):
            found.append(heading)
    return found


def count_words(text: str) -> int:
    """Count words in text."""
    return len(text.split())


def strip_markdown_metadata(text: str) -> str:
    """Remove any front-matter or metadata from Markdown."""
    return re.sub(r"^---\n.*?\n---\n", "", text, flags=re.DOTALL)
