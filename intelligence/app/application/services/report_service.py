from __future__ import annotations

import logging

from app.schemas.request import ReportRequest
from app.application.dto.report_dto import ReportResponseDTO
from app.application.use_cases.generate_executive_report import GenerateExecutiveReport

logger = logging.getLogger(__name__)


class ReportService:
    """Thin service layer wrapping use cases."""

    def __init__(self, generate_executive: GenerateExecutiveReport) -> None:
        self._generate_executive = generate_executive

    async def generate_executive_report(self, request: ReportRequest) -> ReportResponseDTO:
        """Generate an executive report."""
        return await self._generate_executive.execute(request)
