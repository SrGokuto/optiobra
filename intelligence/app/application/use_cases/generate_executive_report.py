from __future__ import annotations

import logging
import time

from app.schemas.request import ReportRequest
from app.application.dto.report_dto import ReportResponseDTO
from app.application.services.context_service import ContextService
from app.application.services.prompt_service import PromptService
from app.application.services.llm_service import LLMService
from app.application.services.markdown_service import MarkdownService

logger = logging.getLogger(__name__)


class GenerateExecutiveReport:
    """Use case: Generate an executive report.

    Flow: validate -> enrich -> build prompt -> call LLM -> validate output -> return DTO
    """

    def __init__(
        self,
        context_service: ContextService,
        prompt_service: PromptService,
        llm_service: LLMService,
        markdown_service: MarkdownService,
    ) -> None:
        self._context_service = context_service
        self._prompt_service = prompt_service
        self._llm_service = llm_service
        self._markdown_service = markdown_service

    async def execute(self, request: ReportRequest) -> ReportResponseDTO:
        """Execute the executive report generation use case."""
        start = time.monotonic()

        logger.info("Generating executive report for project: %s", request.project.name)

        enriched = self._context_service.enrich(request)
        context_dict = enriched.to_dict()

        prompt = self._prompt_service.build("executive", context_dict)

        llm_response, metrics = await self._llm_service.generate(prompt)

        validated_report = self._markdown_service.validate(
            llm_response.text, "executive"
        )

        duration_ms = int((time.monotonic() - start) * 1000)

        dto = ReportResponseDTO(
            success=True,
            report=validated_report,
            model=llm_response.model or metrics.get("model", ""),
            duration_ms=duration_ms,
            prompt_tokens=llm_response.prompt_tokens,
            completion_tokens=llm_response.completion_tokens,
        )

        logger.info(
            "Executive report generated: %dms, %d tokens",
            duration_ms,
            llm_response.prompt_tokens + llm_response.completion_tokens,
        )

        return dto
