from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class LLMResponse:
    """Response from an LLM provider."""

    text: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    duration_ms: int = 0
    model: str = ""


@dataclass
class HealthStatus:
    """Health status of an LLM provider."""

    available: bool
    model_loaded: bool = False
    response_time_ms: int = 0
    message: str = ""


@dataclass
class ModelInfo:
    """Information about the active model."""

    name: str
    quantization: str = ""
    backend: str = ""
    context_size: int = 0


@dataclass
class AnalysisResult:
    """Result from an analyzer plugin."""

    name: str
    priority: str = "medium"
    findings: dict[str, Any] = field(default_factory=dict)
    statistics: dict[str, Any] = field(default_factory=dict)
    alerts: list[dict[str, Any]] = field(default_factory=list)
    recommendations: list[str] = field(default_factory=list)


class LLMProvider(ABC):
    """Interface for LLM providers."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 1200,
    ) -> LLMResponse:
        ...

    @abstractmethod
    async def health(self) -> HealthStatus:
        ...

    @abstractmethod
    async def model_info(self) -> ModelInfo:
        ...

    @abstractmethod
    def token_count(self, text: str) -> int:
        ...

    @abstractmethod
    async def close(self) -> None:
        ...


class AnalyzerPlugin(ABC):
    """Interface for context analyzer plugins."""

    @property
    @abstractmethod
    def name(self) -> str:
        ...

    @abstractmethod
    def analyze(self, context: dict[str, Any]) -> AnalysisResult:
        ...


class PromptBuilder(ABC):
    """Interface for prompt construction."""

    @abstractmethod
    def build(
        self,
        report_type: str,
        context: dict[str, Any],
    ) -> str:
        ...
