from __future__ import annotations

import logging
from typing import Any

from app.application.dto.assistant_dto import AssistantResponseDTO
from app.application.use_cases.generate_assistant_response import GenerateAssistantResponse
from app.application.use_cases.estimate_materials import EstimateMaterials

logger = logging.getLogger(__name__)


class AssistantService:
    """Thin service layer wrapping assistant use cases."""

    def __init__(
        self,
        generate_chat: GenerateAssistantResponse,
        estimate_materials: EstimateMaterials,
    ) -> None:
        self._generate_chat = generate_chat
        self._estimate_materials = estimate_materials

    async def generate_chat(
        self,
        messages: list[dict[str, str]],
        max_tokens: int = 400,
    ) -> AssistantResponseDTO:
        """Generate a conversational reply."""
        return await self._generate_chat.execute(messages, max_tokens)

    async def estimate(
        self,
        descripcion_proyecto: str,
        materiales: list[dict[str, Any]],
        max_tokens: int = 600,
    ) -> AssistantResponseDTO:
        """Estimate material quantities."""
        return await self._estimate_materials.execute(
            descripcion_proyecto,
            materiales,
            max_tokens,
        )