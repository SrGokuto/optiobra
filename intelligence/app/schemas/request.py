from __future__ import annotations

from pydantic import BaseModel, Field


class ProjectData(BaseModel):
    """Project information from Django backend."""

    id: int
    name: str
    location: str = ""
    status: str = "En progreso"
    current_progress: int = Field(ge=0, le=100)
    planned_progress: int = Field(default=0, ge=0, le=100)
    start_date: str = ""
    estimated_finish: str = ""
    last_update: str = ""


class ActivityData(BaseModel):
    """Activity/event information."""

    date: str
    activity: str
    description: str = ""
    responsible: str = ""
    progress_before: int = Field(default=0, ge=0, le=100)
    progress_after: int = Field(default=0, ge=0, le=100)


class MaterialData(BaseModel):
    """Material inventory information."""

    material: str
    category: str = ""
    previous_quantity: int = Field(default=0, ge=0)
    current_quantity: int = Field(default=0, ge=0)
    difference: int = 0
    critical: bool = False


class StatisticsData(BaseModel):
    """Pre-calculated statistics."""

    activities_count: int = 0
    material_changes: int = 0
    critical_materials: int = 0
    average_progress: float = 0.0
    total_progress: int = Field(default=0, ge=0, le=100)


class AlertData(BaseModel):
    """Alert information."""

    type: str
    message: str
    severity: str = "medium"


class TimelineEvent(BaseModel):
    """Timeline event."""

    date: str
    event: str
    type: str = "activity"


class MetadataData(BaseModel):
    """Request metadata."""

    generated_at: str = ""
    language: str = "es"
    report_type: str = "executive"
    timezone: str = "America/Bogota"


class ReportRequest(BaseModel):
    """Main request contract for report generation."""

    project: ProjectData
    activities: list[ActivityData] = Field(default_factory=list)
    materials: list[MaterialData] = Field(default_factory=list)
    statistics: StatisticsData = Field(default_factory=StatisticsData)
    alerts: list[AlertData] = Field(default_factory=list)
    timeline: list[TimelineEvent] = Field(default_factory=list)
    metadata: MetadataData = Field(default_factory=MetadataData)
