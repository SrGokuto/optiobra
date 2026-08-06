"""Tests for the GenerateExecutiveReport use case."""

from __future__ import annotations

import pytest

from app.application.use_cases.generate_executive_report import GenerateExecutiveReport
from app.application.services.context_service import ContextService
from app.application.services.prompt_service import PromptService
from app.application.services.llm_service import LLMService
from app.application.services.markdown_service import MarkdownService
from app.infrastructure.llm.mock_provider import MockProvider


@pytest.fixture
def use_case():
    provider = MockProvider()
    return GenerateExecutiveReport(
        context_service=ContextService(),
        prompt_service=PromptService(),
        llm_service=LLMService(provider=provider),
        markdown_service=MarkdownService(),
    )


class TestGenerateExecutiveReport:
    @pytest.mark.asyncio
    async def test_execute_returns_dto(self, use_case, sample_request):
        result = await use_case.execute(sample_request)
        assert result.success is True
        assert len(result.report) > 0

    @pytest.mark.asyncio
    async def test_execute_with_minimal_request(self, use_case, minimal_request):
        result = await use_case.execute(minimal_request)
        assert result.success is True

    @pytest.mark.asyncio
    async def test_report_contains_headings(self, use_case, sample_request):
        result = await use_case.execute(sample_request)
        assert "Resumen" in result.report

    @pytest.mark.asyncio
    async def test_metrics_populated(self, use_case, sample_request):
        result = await use_case.execute(sample_request)
        assert result.duration_ms > 0
        assert result.model == "MockModel-v1"
