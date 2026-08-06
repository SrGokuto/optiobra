from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.exceptions.custom_errors import (
    IntelligenceError,
)

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    """Register all exception handlers on the FastAPI app."""

    @app.exception_handler(IntelligenceError)
    async def intelligence_error_handler(request: Request, exc: IntelligenceError) -> JSONResponse:
        status_map = {
            "INVALID_CONTEXT": 400,
            "LLM_TIMEOUT": 504,
            "LLM_UNAVAILABLE": 503,
            "INVALID_OUTPUT": 422,
            "MODEL_NOT_LOADED": 503,
        }
        status_code = status_map.get(exc.error, 500)
        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "error": exc.error,
                "message": exc.message,
            },
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": "VALIDATION_ERROR",
                "message": str(exc),
            },
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
            },
        )
