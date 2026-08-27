from __future__ import annotations

import logging

from fastapi import APIRouter, Depends

from app.schemas.assistant import (
    AssistantChatRequest,
    AssistantChatResponse,
    EstimateRequest,
)
from app.schemas.response import ErrorResponse
from app.api.dependencies.providers import get_assistant_service
from app.application.services.assistant_service import AssistantService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["assistant"])


@router.post(
    "/assistant/chat",
    response_model=AssistantChatResponse,
    responses={503: {"model": ErrorResponse}},
)
async def assistant_chat(
    request: AssistantChatRequest,
    service: AssistantService = Depends(get_assistant_service),
) -> AssistantChatResponse:
    """Generate a conversational reply for the project assistant."""
    result = await service.generate_chat(
        [{"rol": m.rol, "contenido": m.contenido} for m in request.messages],
        max_tokens=request.max_tokens,
    )
    return AssistantChatResponse(
        success=result.success,
        reply=result.reply,
        model=result.model,
        duration_ms=result.duration_ms,
    )


@router.post(
    "/assistant/estimate",
    response_model=AssistantChatResponse,
    responses={503: {"model": ErrorResponse}},
)
async def assistant_estimate(
    request: EstimateRequest,
    service: AssistantService = Depends(get_assistant_service),
) -> AssistantChatResponse:
    """Estimate material quantities for a project description."""
    result = await service.estimate(
        request.descripcion_proyecto,
        [{"nombre": m.nombre, "unidad": m.unidad} for m in request.materiales],
        max_tokens=request.max_tokens,
    )
    return AssistantChatResponse(
        success=result.success,
        reply=result.reply,
        model=result.model,
        duration_ms=result.duration_ms,
    )