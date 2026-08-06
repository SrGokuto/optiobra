"""Tests for Pydantic request/response schemas."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas.request import (
    ReportRequest,
    ProjectData,
    ActivityData,
    MaterialData,
    StatisticsData,
)
from app.schemas.response import ReportResponse, ErrorResponse


class TestProjectData:
    def test_valid_project(self):
        project = ProjectData(
            id=1, name="Test", current_progress=50
        )
        assert project.name == "Test"
        assert project.current_progress == 50

    def test_progress_bounds(self):
        with pytest.raises(ValidationError):
            ProjectData(id=1, name="Test", current_progress=101)

    def test_negative_progress(self):
        with pytest.raises(ValidationError):
            ProjectData(id=1, name="Test", current_progress=-1)


class TestActivityData:
    def test_valid_activity(self):
        activity = ActivityData(
            date="2026-08-06", activity="Test Activity"
        )
        assert activity.date == "2026-08-06"

    def test_defaults(self):
        activity = ActivityData(date="2026-08-06", activity="Test")
        assert activity.progress_before == 0
        assert activity.progress_after == 0


class TestMaterialData:
    def test_valid_material(self):
        material = MaterialData(
            material="Cemento", current_quantity=100
        )
        assert material.material == "Cemento"

    def test_critical_default(self):
        material = MaterialData(material="Test")
        assert material.critical is False


class TestReportRequest:
    def test_valid_request(self, sample_request):
        assert sample_request.project.name == "Hospital Norte"
        assert len(sample_request.activities) == 2

    def test_minimal_request(self, minimal_request):
        assert minimal_request.activities == []
        assert minimal_request.materials == []

    def test_empty_project_fails(self):
        with pytest.raises(ValidationError):
            ReportRequest(project=None)


class TestReportResponse:
    def test_success_response(self):
        response = ReportResponse(
            success=True, report="# Test Report"
        )
        assert response.success is True

    def test_error_response(self):
        error = ErrorResponse(
            error="INVALID_CONTEXT", message="Missing data"
        )
        assert error.success is False
