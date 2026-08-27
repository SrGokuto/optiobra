from __future__ import annotations

import logging
import time
from typing import Any

from app.application.dto.assistant_dto import AssistantResponseDTO
from app.application.services.prompt_service import PromptService
from app.application.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class GenerateAssistantResponse:
    """Use case: generate a chat response for the project assistant."""

    def __init__(
        self,
        prompt_service: PromptService,
        llm_service: LLMService,
    ) -> None:
        self._prompt_service = prompt_service
        self._llm_service = llm_service

    async def execute(
        self,
        messages: list[dict[str, str]],
        max_tokens: int = 400,
    ) -> AssistantResponseDTO:
        """Generate a conversational reply based on the message history."""
        start = time.monotonic()

        prompt = self._prompt_service.build_assistant(messages)

        llm_response, metrics = await self._llm_service.generate(
            prompt,
            temperature=0.4,
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
            "Assistant reply generated: %dms, %d tokens",
            duration_ms,
            llm_response.prompt_tokens + llm_response.completion_tokens,
        )
        return dto