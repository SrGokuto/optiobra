"""Tests for FastAPI API endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.config.settings import get_settings

# Override to use mock provider for tests
import os
os.environ["USE_MOCK"] = "true"


@pytest.fixture
def anyio_backend():
    return "asyncio"


class TestHealthEndpoints:
    @pytest.mark.asyncio
    async def test_health_check(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    @pytest.mark.asyncio
    async def test_info(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/info")
        assert response.status_code == 200
        data = response.json()
        assert "version" in data
        assert "model" in data


class TestReportEndpoints:
    @pytest.mark.asyncio
    async def test_executive_report(self):
        transport = ASGITransport(app=app)
        payload = {
            "project": {
                "id": 1,
                "name": "Test Project",
                "location": "Bogota",
                "status": "En progreso",
                "current_progress": 65,
                "planned_progress": 70,
            },
            "activities": [
                {
                    "date": "2026-08-01",
                    "activity": "Fundicion",
                    "description": "Test",
                    "responsible": "Carlos",
                    "progress_before": 62,
                    "progress_after": 65,
                }
            ],
            "materials": [
                {
                    "material": "Cemento",
                    "category": "Construccion",
                    "previous_quantity": 320,
                    "current_quantity": 180,
                    "difference": -140,
                    "critical": False,
                }
            ],
            "statistics": {
                "activities_count": 1,
                "material_changes": 1,
                "critical_materials": 0,
                "average_progress": 65.0,
                "total_progress": 65,
            },
            "alerts": [],
            "timeline": [],
            "metadata": {
                "generated_at": "2026-08-06T10:00:00",
                "language": "es",
                "report_type": "executive",
                "timezone": "America/Bogota",
            },
        }
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/report/executive", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "report" in data
        assert len(data["report"]) > 0

    @pytest.mark.asyncio
    async def test_daily_report_not_implemented(self):
        transport = ASGITransport(app=app)
        payload = {
            "project": {
                "id": 1,
                "name": "Test",
                "status": "En progreso",
                "current_progress": 50,
            }
        }
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/v1/report/daily", json=payload)
        assert response.status_code == 501

    @pytest.mark.asyncio
    async def test_executive_report_minimal(self):
        transport = ASGITransport(app=app)
        payload = {
            "project": {
                "id": 1,
                "name": "Minimal Project",
                "status": "En progreso",
                "current_progress": 30,
            }
        }
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/v1/report/executive", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
