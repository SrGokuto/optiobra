"""Tests for the project assistant (chat and material estimation)."""

from __future__ import annotations

import pytest

from app.application.services.prompt_service import PromptService
from app.application.use_cases.generate_assistant_response import GenerateAssistantResponse
from app.application.use_cases.estimate_materials import EstimateMaterials
from app.application.services.llm_service import LLMService


class TestAssistantPrompts:
    def test_build_assistant_prompt(self):
        service = PromptService()
        prompt = service.build_assistant([
            {"rol": "usuario", "contenido": "Quiero construir una casa de 2 pisos"},
        ])
        assert len(prompt) > 0
        assert "Quiero construir una casa de 2 pisos" in prompt
        assert "Usuario:" in prompt

    def test_build_assistant_prompt_includes_history(self):
        service = PromptService()
        prompt = service.build_assistant([
            {"rol": "usuario", "contenido": "Casa"},
            {"rol": "asistente", "contenido": "Necesitas cemento"},
            {"rol": "usuario", "contenido": "Cuantas bolsas?"},
        ])
        assert "Necesitas cemento" in prompt
        assert prompt.count("Asistente:") == 1

    def test_build_estimate_prompt(self):
        service = PromptService()
        prompt = service.build_estimate(
            [{"rol": "usuario", "contenido": "Quiero una casa de 2 pisos de 120 m2"}],
            [{"nombre": "Cemento", "unidad": "bolsas"}],
        )
        assert "Quiero una casa de 2 pisos de 120 m2" in prompt
        assert "Cemento" in prompt
        assert "bolsas" in prompt


class TestAssistantUseCases:
    @pytest.fixture
    def llm_service(self):
        from app.infrastructure.llm.mock_provider import MockProvider
        return LLMService(provider=MockProvider())

    @pytest.mark.asyncio
    async def test_generate_assistant_response(self, llm_service):
        service = GenerateAssistantResponse(
            prompt_service=PromptService(),
            llm_service=llm_service,
        )
        dto = await service.execute(
            [{"rol": "usuario", "contenido": "Quiero construir una bodega"}],
            max_tokens=300,
        )
        assert dto.success is True
        assert len(dto.reply) > 0
        assert dto.duration_ms >= 0

    @pytest.mark.asyncio
    async def test_estimate_materials(self, llm_service):
        service = EstimateMaterials(
            prompt_service=PromptService(),
            llm_service=llm_service,
        )
        dto = await service.execute(
            [{"rol": "usuario", "contenido": "Casa de 2 pisos, 120 m2"}],
            [{"nombre": "Cemento", "unidad": "bolsas"}],
            max_tokens=300,
        )
        assert dto.success is True
        assert len(dto.reply) > 0

    @pytest.mark.asyncio
    async def test_chat_extracts_materiales(self, llm_service):
        service = GenerateAssistantResponse(
            prompt_service=PromptService(),
            llm_service=llm_service,
        )
        # El mock devuelve MOCK_REPORT sin JSON; probamos el extractor aparte
        reply, materiales = service._extract_materiales(
            "Necesitas: cemento y ladrillo\n```json\n"
            '{"materiales": [{"nombre": "Cemento", "unidad": "bolsas"}, '
            '{"nombre": "Ladrillo", "unidad": "unidades"}]}\n```'
        )
        assert "Necesitas: cemento y ladrillo" in reply
        assert len(materiales) == 2
        assert materiales[0]["nombre"] == "Cemento"