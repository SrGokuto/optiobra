from __future__ import annotations

import logging
import time
from typing import Any

from app.application.dto.assistant_dto import AssistantResponseDTO
from app.application.services.prompt_service import PromptService
from app.application.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class EstimateMaterials:
    """Use case: estimate material quantities for a project."""

    def __init__(
        self,
        prompt_service: PromptService,
        llm_service: LLMService,
    ) -> None:
        self._prompt_service = prompt_service
        self._llm_service = llm_service

    async def execute(
        self,
        descripcion_proyecto: str,
        materiales: list[dict[str, Any]],
        max_tokens: int = 600,
    ) -> AssistantResponseDTO:
        """Estimate quantities for the given materials."""
        start = time.monotonic()

        prompt = self._prompt_service.build_estimate(descripcion_proyecto, materiales)

        llm_response, metrics = await self._llm_service.generate(
            prompt,
            temperature=0.2,
            max_tokens=max_tokens,
        )

        duration_ms = int((time.monotonic() - start) * 1000)

        dto = AssistantResponseDTO(
            success=True,
            reply=llm_response.text.strip(),
            model=llm_response.model or metrics.get("model", ""),
            duration_ms=duration_ms,
        )

        logger.info(
            "Material estimate generated: %dms, %d tokens",
            duration_ms,
            llm_response.prompt_tokens + llm_response.completion_tokens,
        )
        return dto