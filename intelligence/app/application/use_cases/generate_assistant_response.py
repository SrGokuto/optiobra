from __future__ import annotations

import json
import logging
import re
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

        reply, materiales = self._extract_materiales(llm_response.text.strip())

        dto = AssistantResponseDTO(
            success=True,
            reply=reply,
            model=llm_response.model or metrics.get("model", ""),
            duration_ms=duration_ms,
            materiales=materiales,
        )

        logger.info(
            "Assistant reply generated: %dms, %d tokens, %d materiales",
            duration_ms,
            llm_response.prompt_tokens + llm_response.completion_tokens,
            len(materiales),
        )
        return dto

    def _extract_materiales(self, text: str) -> tuple[str, list[dict[str, Any]]]:
        """Extract the structured materials JSON block from the reply.

        Returns the cleaned reply text and the parsed materials list.
        """
        pattern = r'\{[^{}]*"materiales"\s*:\s*\[[^]]*\]\s*\}'
        match = re.search(pattern, text, re.DOTALL)
        materiales: list[dict[str, Any]] = []

        if match:
            raw = match.group(0)
            try:
                data = json.loads(raw)
                materiales = data.get("materiales", [])
                if not isinstance(materiales, list):
                    materiales = []
            except json.JSONDecodeError:
                logger.warning("No se pudo parsear el bloque de materiales")
                materiales = []

            text = text.replace(raw, "")

        text = re.sub(r"```json\s*", "", text)
        text = re.sub(r"```", "", text)

        normalized: list[dict[str, Any]] = []
        for mat in materiales:
            if isinstance(mat, dict) and mat.get("nombre"):
                normalized.append({
                    "nombre": str(mat["nombre"]).strip(),
                    "unidad": str(mat.get("unidad", "") or "").strip(),
                })
        return text.strip(), normalized