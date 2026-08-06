"""Tests for prompt builder."""

from __future__ import annotations

import pytest

from app.application.services.prompt_service import PromptService


class TestPromptService:
    def test_build_executive_prompt(self, sample_request):
        service = PromptService()
        from app.application.services.context_service import ContextService
        ctx_service = ContextService()
        enriched = ctx_service.enrich(sample_request)
        prompt = service.build("executive", enriched.to_dict())
        assert len(prompt) > 0
        assert "Hospital Norte" in prompt

    def test_build_contains_system_prompt(self, sample_request):
        service = PromptService()
        from app.application.services.context_service import ContextService
        ctx_service = ContextService()
        enriched = ctx_service.enrich(sample_request)
        prompt = service.build("executive", enriched.to_dict())
        assert "ingenieria civil" in prompt.lower() or "construccion" in prompt.lower()

    def test_build_contains_project_data(self, sample_request):
        service = PromptService()
        from app.application.services.context_service import ContextService
        ctx_service = ContextService()
        enriched = ctx_service.enrich(sample_request)
        prompt = service.build("executive", enriched.to_dict())
        assert "Hospital Norte" in prompt
        assert "65%" in prompt

    def test_build_contains_materials(self, sample_request):
        service = PromptService()
        from app.application.services.context_service import ContextService
        ctx_service = ContextService()
        enriched = ctx_service.enrich(sample_request)
        prompt = service.build("executive", enriched.to_dict())
        assert "Cemento" in prompt
        assert "Arena" in prompt

    def test_build_minimal_context(self, minimal_request):
        service = PromptService()
        from app.application.services.context_service import ContextService
        ctx_service = ContextService()
        enriched = ctx_service.enrich(minimal_request)
        prompt = service.build("executive", enriched.to_dict())
        assert len(prompt) > 0
