from __future__ import annotations

from enum import Enum


class ReportType(str, Enum):
    EXECUTIVE = "executive"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class AlertType(str, Enum):
    LOW_STOCK = "LOW_STOCK"
    NEGATIVE_PROGRESS = "NEGATIVE_PROGRESS"
    DELAY = "DELAY"
    NO_ACTIVITY = "NO_ACTIVITY"
    EXCESSIVE_CONSUMPTION = "EXCESSIVE_CONSUMPTION"
    MISSING_INFORMATION = "MISSING_INFORMATION"


class Trend(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    STABLE = "stable"
    STAGNANT = "stagnant"


class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ProjectStatus(str, Enum):
    PENDING = "Pendiente"
    IN_PROGRESS = "En progreso"
    COMPLETED = "Completado"


class MaterialCriticality(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    NORMAL = "normal"
