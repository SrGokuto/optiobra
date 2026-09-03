from __future__ import annotations

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """A single chat message."""

    rol: str
    contenido: str


class AssistantChatRequest(BaseModel):
    """Request contract for assistant chat."""

    messages: list[ChatMessage] = Field(default_factory=list)
    max_tokens: int = 400


class EstimateMaterialItem(BaseModel):
    """Material to estimate."""

    nombre: str
    unidad: str = ""


class EstimateRequest(BaseModel):
    """Request contract for material quantity estimation."""

    mensajes: list[ChatMessage] = Field(default_factory=list)
    materiales: list[EstimateMaterialItem] = Field(default_factory=list)
    max_tokens: int = 600


class AssistantChatResponse(BaseModel):
    """Response for assistant operations."""

    success: bool = True
    reply: str
    model: str = ""
    duration_ms: int = 0
    materiales: list[EstimateMaterialItem] = Field(default_factory=list)