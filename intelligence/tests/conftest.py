"""Shared test fixtures for the intelligence engine."""

from __future__ import annotations

import pytest

from app.schemas.request import (
    ReportRequest,
    ProjectData,
    ActivityData,
    MaterialData,
    StatisticsData,
    AlertData,
    MetadataData,
)


@pytest.fixture
def sample_project() -> dict:
    return {
        "id": 1,
        "name": "Hospital Norte",
        "location": "Bogota",
        "status": "En progreso",
        "current_progress": 65,
        "planned_progress": 70,
        "start_date": "2026-01-15",
        "estimated_finish": "2026-12-30",
        "last_update": "2026-08-06",
    }


@pytest.fixture
def sample_activities() -> list[dict]:
    return [
        {
            "date": "2026-08-01",
            "activity": "Fundicion",
            "description": "Se completo el bloque A",
            "responsible": "Carlos",
            "progress_before": 62,
            "progress_after": 65,
        },
        {
            "date": "2026-08-03",
            "activity": "Montaje de acero",
            "description": "Estructura zona norte",
            "responsible": "Maria",
            "progress_before": 65,
            "progress_after": 67,
        },
    ]


@pytest.fixture
def sample_materials() -> list[dict]:
    return [
        {
            "material": "Cemento",
            "category": "Construccion",
            "previous_quantity": 320,
            "current_quantity": 180,
            "difference": -140,
            "critical": False,
        },
        {
            "material": "Arena",
            "category": "Construccion",
            "previous_quantity": 350,
            "current_quantity": 80,
            "difference": -270,
            "critical": True,
        },
    ]


@pytest.fixture
def sample_statistics() -> dict:
    return {
        "activities_count": 12,
        "material_changes": 18,
        "critical_materials": 2,
        "average_progress": 5.0,
        "total_progress": 65,
    }


@pytest.fixture
def sample_alerts() -> list[dict]:
    return [
        {"type": "LOW_STOCK", "message": "Arena por debajo del minimo", "severity": "high"},
    ]


@pytest.fixture
def sample_timeline() -> list[dict]:
    return [
        {"date": "2026-08-01", "event": "Inicio cimentacion", "type": "activity"},
        {"date": "2026-08-03", "event": "Llegada de acero", "type": "material"},
    ]


@pytest.fixture
def sample_metadata() -> dict:
    return {
        "generated_at": "2026-08-06T10:00:00",
        "language": "es",
        "report_type": "executive",
        "timezone": "America/Bogota",
    }


@pytest.fixture
def sample_request(
    sample_project,
    sample_activities,
    sample_materials,
    sample_statistics,
    sample_alerts,
    sample_timeline,
    sample_metadata,
) -> ReportRequest:
    return ReportRequest(
        project=ProjectData(**sample_project),
        activities=[ActivityData(**a) for a in sample_activities],
        materials=[MaterialData(**m) for m in sample_materials],
        statistics=StatisticsData(**sample_statistics),
        alerts=[AlertData(**a) for a in sample_alerts],
        timeline=[],
        metadata=MetadataData(**sample_metadata),
    )


@pytest.fixture
def minimal_request(sample_project) -> ReportRequest:
    return ReportRequest(
        project=ProjectData(**sample_project),
    )
