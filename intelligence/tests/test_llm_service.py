"""Tests for LLM service (cache, retry, metrics)."""

from __future__ import annotations

import pytest
import asyncio

from app.infrastructure.llm.mock_provider import MockProvider
from app.application.services.llm_service import LLMService


@pytest.fixture
def mock_provider():
    return MockProvider()


@pytest.fixture
def llm_service(mock_provider):
    return LLMService(provider=mock_provider, cache_ttl=60, max_retries=1)


class TestLLMService:
    @pytest.mark.asyncio
    async def test_generate_returns_response(self, llm_service):
        response, metrics = await llm_service.generate("Test prompt")
        assert response.text is not None
        assert len(response.text) > 0

    @pytest.mark.asyncio
    async def test_cache_hit(self, llm_service):
        response1, metrics1 = await llm_service.generate("Test prompt")
        response2, metrics2 = await llm_service.generate("Test prompt")
        assert metrics2["cache_hit"] is True
        assert response1.text == response2.text

    @pytest.mark.asyncio
    async def test_different_prompts_no_cache_hit(self, llm_service):
        _, metrics1 = await llm_service.generate("Prompt 1")
        _, metrics2 = await llm_service.generate("Prompt 2")
        assert metrics1["cache_hit"] is False
        assert metrics2["cache_hit"] is False

    @pytest.mark.asyncio
    async def test_metrics_recorded(self, llm_service):
        response, metrics = await llm_service.generate("Test")
        assert "provider" in metrics
        assert "model" in metrics

    @pytest.mark.asyncio
    async def test_clear_cache(self, llm_service):
        await llm_service.generate("Test prompt")
        llm_service.clear_cache()
        _, metrics = await llm_service.generate("Test prompt")
        assert metrics["cache_hit"] is False


class TestMockProvider:
    @pytest.mark.asyncio
    async def test_generate(self):
        provider = MockProvider()
        response = await provider.generate("Test")
        assert response.text is not None
        assert "Resumen Ejecutivo" in response.text

    @pytest.mark.asyncio
    async def test_health(self):
        provider = MockProvider()
        status = await provider.health()
        assert status.available is True

    @pytest.mark.asyncio
    async def test_model_info(self):
        provider = MockProvider()
        info = await provider.model_info()
        assert info.name == "MockModel-v1"

    def test_token_count(self):
        provider = MockProvider()
        count = provider.token_count("Hello world test")
        assert count > 0
