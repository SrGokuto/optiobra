from __future__ import annotations

import logging

from fastapi import APIRouter, Depends

from app.schemas.request import ReportRequest
from app.schemas.response import ReportResponse, ErrorResponse
from app.api.dependencies.providers import get_report_service
from app.application.services.report_service import ReportService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["reports"])


@router.post(
    "/report/executive",
    response_model=ReportResponse,
    responses={400: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
)
async def generate_executive_report(
    request: ReportRequest,
    service: ReportService = Depends(get_report_service),
) -> ReportResponse:
    """Generate an executive report for a construction project."""
    result = await service.generate_executive_report(request)
    return ReportResponse(
        success=result.success,
        report=result.report,
        model=result.model,
        duration_ms=result.duration_ms,
        prompt_tokens=result.prompt_tokens,
        completion_tokens=result.completion_tokens,
    )


@router.post(
    "/report/daily",
    response_model=ReportResponse,
    responses={501: {"model": ErrorResponse}},
)
async def generate_daily_report(request: ReportRequest) -> ReportResponse:
    """Generate a daily report (not yet implemented)."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Daily report not yet implemented")


@router.post(
    "/report/weekly",
    response_model=ReportResponse,
    responses={501: {"model": ErrorResponse}},
)
async def generate_weekly_report(request: ReportRequest) -> ReportResponse:
    """Generate a weekly report (not yet implemented)."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Weekly report not yet implemented")


@router.post(
    "/report/monthly",
    response_model=ReportResponse,
    responses={501: {"model": ErrorResponse}},
)
async def generate_monthly_report(request: ReportRequest) -> ReportResponse:
    """Generate a monthly report (not yet implemented)."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Monthly report not yet implemented")
