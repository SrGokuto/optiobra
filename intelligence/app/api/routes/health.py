from __future__ import annotations

import logging

from fastapi import APIRouter, Depends

from app.schemas.response import HealthResponse, InfoResponse
from app.api.dependencies.providers import get_health_service
from app.application.services.health_service import HealthService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check(
    service: HealthService = Depends(get_health_service),
) -> HealthResponse:
    """Health check endpoint."""
    result = await service.check_health()
    return HealthResponse(
        status=result["status"],
        version=result["version"],
        uptime_seconds=result["uptime_seconds"],
    )


@router.get("/info", response_model=InfoResponse)
async def engine_info(
    service: HealthService = Depends(get_health_service),
) -> InfoResponse:
    """Engine information endpoint."""
    result = await service.get_info()
    return InfoResponse(
        version=result["version"],
        model=result["model"],
        provider=result["provider"],
        uptime_seconds=result["uptime_seconds"],
    )
