from __future__ import annotations

import time

from app.domain.common.interfaces import LLMProvider, LLMResponse, HealthStatus, ModelInfo


MOCK_REPORT = """# Resumen Ejecutivo

## Estado del Proyecto

El proyecto se encuentra en fase de ejecucion con un avance general del 65%. Se han completado las actividades de cimentacion y se encuentra en curso la estructura principal.

## Actividades Relevantes

- Se completaron las actividades de fundicion del bloque A.
- Se realizo el montaje de acero estructural en zona norte.
- Se ejecutaron trabajos de preparacion para el siguiente nivel.

## Materiales

El inventario presenta niveles adecuados en la mayoria de categorias. Se detecta consumo elevado de cemento respecto al periodo anterior, coherente con las actividades de fundicion ejecutadas.

## Riesgos

- Se identifica un posible retraso en la entrega de materiales prefabricados.
- El consumo acelerado de aggregates puede afectar el inventario si no se gestiona la reposicion.

## Observaciones

El ritmo de avance es consistente con el cronograma establecido. Las actividades criticas se encuentran dentro de los parametros esperados.

## Recomendaciones

Se recomienda monitorear el inventario de cemento y aggregates para asegurar la continuidad de las actividades programadas.

## Conclusión

El proyecto mantiene un avance aceptable. Se requiere atencion al manejo de inventario de materiales criticos para evitar interrupciones en las actividades futuras.
"""


class MockProvider(LLMProvider):
    """Mock LLM provider for testing without a real model."""

    def __init__(self) -> None:
        self._request_count = 0

    async def generate(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 1200,
    ) -> LLMResponse:
        """Return a predefined mock report."""
        self._request_count += 1

        word_count = len(MOCK_REPORT.split())
        return LLMResponse(
            text=MOCK_REPORT,
            prompt_tokens=len(prompt) // 4,
            completion_tokens=word_count * 2,
            duration_ms=50,
            model="MockModel-v1",
        )

    async def health(self) -> HealthStatus:
        return HealthStatus(
            available=True,
            model_loaded=True,
            response_time_ms=1,
            message="Mock provider always healthy",
        )

    async def model_info(self) -> ModelInfo:
        return ModelInfo(
            name="MockModel-v1",
            quantization="N/A",
            backend="mock",
            context_size=4096,
        )

    def token_count(self, text: str) -> int:
        return len(text) // 4

    async def close(self) -> None:
        pass
