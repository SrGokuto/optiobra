from __future__ import annotations

import logging
from typing import Any

import httpx

from django.conf import settings

logger = logging.getLogger(__name__)

DEFAULT_INTELLIGENCE_URL = "http://localhost:8000"


class IntelligenceClient:
    """HTTP client to communicate with the Intelligence Engine."""

    def __init__(self, base_url: str | None = None) -> None:
        self._base_url = (
            base_url
            or getattr(settings, "INTELLIGENCE_URL", DEFAULT_INTELLIGENCE_URL)
        ).rstrip("/")
        self._timeout = getattr(settings, "INTELLIGENCE_TIMEOUT", 30)

    async def generate_executive_report(
        self, context: dict[str, Any]
    ) -> dict[str, Any]:
        """Send context to intelligence engine and get executive report."""
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            try:
                response = await client.post(
                    f"{self._base_url}/api/v1/report/executive",
                    json=context,
                )
                response.raise_for_status()
                return response.json()
            except httpx.TimeoutException:
                logger.error("Intelligence engine timed out")
                return {
                    "success": False,
                    "error": "LLM_TIMEOUT",
                    "message": "El motor de inteligencia no responde",
                }
            except httpx.HTTPStatusError as e:
                logger.error("Intelligence engine error: %s", e.response.status_code)
                return {
                    "success": False,
                    "error": "LLM_ERROR",
                    "message": f"Error del motor de inteligencia: {e.response.status_code}",
                }
            except Exception as e:
                logger.error("Intelligence engine connection failed: %s", str(e))
                return {
                    "success": False,
                    "error": "CONNECTION_ERROR",
                    "message": "No se pudo conectar con el motor de inteligencia",
                }

    async def health_check(self) -> dict[str, Any]:
        """Check intelligence engine health."""
        async with httpx.AsyncClient(timeout=5) as client:
            try:
                response = await client.get(
                    f"{self._base_url}/api/v1/health"
                )
                response.raise_for_status()
                return response.json()
            except Exception:
                return {"status": "unavailable"}

    def generate_executive_report_sync(
        self, context: dict[str, Any]
    ) -> dict[str, Any]:
        """Synchronous version for Django views."""
        with httpx.Client(timeout=self._timeout) as client:
            try:
                response = client.post(
                    f"{self._base_url}/api/v1/report/executive",
                    json=context,
                )
                response.raise_for_status()
                return response.json()
            except httpx.TimeoutException:
                logger.error("Intelligence engine timed out")
                return {
                    "success": False,
                    "error": "LLM_TIMEOUT",
                    "message": "El motor de inteligencia no responde",
                }
            except Exception as e:
                logger.error("Intelligence engine error: %s", str(e))
                return {
                    "success": False,
                    "error": "CONNECTION_ERROR",
                    "message": "No se pudo conectar con el motor de inteligencia",
                }

    def send_assistant_message_sync(
        self, messages: list[dict[str, str]], max_tokens: int = 400
    ) -> dict[str, Any]:
        """Send a chat message to the project assistant and get the reply."""
        with httpx.Client(timeout=self._timeout) as client:
            try:
                response = client.post(
                    f"{self._base_url}/api/v1/assistant/chat",
                    json={"messages": messages, "max_tokens": max_tokens},
                )
                response.raise_for_status()
                return response.json()
            except httpx.TimeoutException:
                logger.error("Intelligence engine timed out")
                return {
                    "success": False,
                    "error": "LLM_TIMEOUT",
                    "message": "El motor de inteligencia no responde",
                }
            except httpx.HTTPStatusError as e:
                logger.error("Intelligence engine error: %s", e.response.status_code)
                return {
                    "success": False,
                    "error": "LLM_ERROR",
                    "message": f"Error del motor de inteligencia: {e.response.status_code}",
                }
            except Exception as e:
                logger.error("Intelligence engine connection failed: %s", str(e))
                return {
                    "success": False,
                    "error": "CONNECTION_ERROR",
                    "message": "No se pudo conectar con el motor de inteligencia",
                }

    def estimate_materials_sync(
        self, descripcion_proyecto: str, materiales: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Estimate material quantities for a project description."""
        with httpx.Client(timeout=self._timeout) as client:
            try:
                response = client.post(
                    f"{self._base_url}/api/v1/assistant/estimate",
                    json={
                        "descripcion_proyecto": descripcion_proyecto,
                        "materiales": materiales,
                    },
                )
                response.raise_for_status()
                return response.json()
            except httpx.TimeoutException:
                logger.error("Intelligence engine timed out")
                return {
                    "success": False,
                    "error": "LLM_TIMEOUT",
                    "message": "El motor de inteligencia no responde",
                }
            except httpx.HTTPStatusError as e:
                logger.error("Intelligence engine error: %s", e.response.status_code)
                return {
                    "success": False,
                    "error": "LLM_ERROR",
                    "message": f"Error del motor de inteligencia: {e.response.status_code}",
                }
            except Exception as e:
                logger.error("Intelligence engine connection failed: %s", str(e))
                return {
                    "success": False,
                    "error": "CONNECTION_ERROR",
                    "message": "No se pudo conectar con el motor de inteligencia",
                }
