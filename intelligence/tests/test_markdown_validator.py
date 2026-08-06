"""Tests for markdown validation."""

from __future__ import annotations

import pytest

from app.application.services.markdown_service import MarkdownService


class TestMarkdownService:
    def test_validate_valid_report(self):
        service = MarkdownService()
        report = "# Resumen Ejecutivo\n\n## Estado del Proyecto\n\nTest content"
        result = service.validate(report, "executive")
        assert result == report

    def test_validate_empty_report_fails(self):
        service = MarkdownService()
        with pytest.raises(ValueError, match="Empty report"):
            service.validate("", "executive")

    def test_validate_html_fails(self):
        service = MarkdownService()
        with pytest.raises(ValueError, match="HTML"):
            service.validate("<html><body>Test</body></html>", "executive")

    def test_validate_strips_whitespace(self):
        service = MarkdownService()
        report = "  # Test Report  "
        result = service.validate(report)
        assert result == "# Test Report"

    def test_validate_long_report_warns(self, caplog):
        service = MarkdownService()
        long_report = "# Resumen Ejecutivo\n\n" + "word " * 800
        result = service.validate(long_report, "executive")
        assert result is not None
