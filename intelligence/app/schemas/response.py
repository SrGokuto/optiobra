from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ReportResponse(BaseModel):
    """Successful report generation response."""

    success: bool = True
    report: str
    model: str = ""
    duration_ms: int = 0
    prompt_tokens: int = 0
    completion_tokens: int = 0


class ErrorResponse(BaseModel):
    """Error response."""

    success: bool = False
    error: str
    message: str


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "healthy"
    version: str = ""
    uptime_seconds: float = 0.0


class InfoResponse(BaseModel):
    """Engine info response."""

    version: str = ""
    model: str = ""
    provider: str = ""
    uptime_seconds: float = 0.0
