from __future__ import annotations

import logging

from app.config.settings import get_settings
from app.infrastructure.llm.provider_factory import create_provider
from app.infrastructure.cache.response_cache import ResponseCache
from app.infrastructure.metrics.llm_metrics import LLMMetrics
from app.application.services.context_service import ContextService
from app.application.services.prompt_service import PromptService
from app.application.services.llm_service import LLMService
from app.application.services.markdown_service import MarkdownService
from app.application.services.health_service import HealthService
from app.application.services.report_service import ReportService
from app.application.use_cases.generate_executive_report import GenerateExecutiveReport
from app.domain.analysis.project_analyzer import ProjectAnalyzer
from app.domain.analysis.material_analyzer import MaterialAnalyzer
from app.domain.analysis.progress_analyzer import ProgressAnalyzer
from app.domain.analysis.timeline_analyzer import TimelineAnalyzer
from app.domain.analysis.statistics_analyzer import StatisticsAnalyzer
from app.domain.analysis.alert_analyzer import AlertAnalyzer
from app.domain.analysis.recommendation_analyzer import RecommendationAnalyzer

logger = logging.getLogger(__name__)

_provider = None
_services_initialized = False


def get_provider():
    global _provider
    if _provider is None:
        _provider = create_provider()
    return _provider


def get_context_service() -> ContextService:
    settings = get_settings()
    service = ContextService()
    service.register_analyzer(ProjectAnalyzer())
    service.register_analyzer(MaterialAnalyzer())
    service.register_analyzer(ProgressAnalyzer())
    service.register_analyzer(TimelineAnalyzer())
    service.register_analyzer(StatisticsAnalyzer())
    service.register_analyzer(AlertAnalyzer())
    service.register_analyzer(RecommendationAnalyzer())
    return service


def get_prompt_service() -> PromptService:
    return PromptService()


def get_llm_service() -> LLMService:
    settings = get_settings()
    return LLMService(
        provider=get_provider(),
        cache_ttl=settings.CACHE_TTL,
        request_timeout=settings.REQUEST_TIMEOUT,
    )


def get_markdown_service() -> MarkdownService:
    return MarkdownService()


def get_health_service() -> HealthService:
    settings = get_settings()
    return HealthService(
        provider=get_provider(),
        version=settings.APP_VERSION,
    )


def get_report_service() -> ReportService:
    generate_executive = GenerateExecutiveReport(
        context_service=get_context_service(),
        prompt_service=get_prompt_service(),
        llm_service=get_llm_service(),
        markdown_service=get_markdown_service(),
    )
    return ReportService(generate_executive=generate_executive)


def get_assistant_service():
    from app.application.services.assistant_service import AssistantService
    from app.application.use_cases.generate_assistant_response import GenerateAssistantResponse
    from app.application.use_cases.estimate_materials import EstimateMaterials

    return AssistantService(
        generate_chat=GenerateAssistantResponse(
            prompt_service=get_prompt_service(),
            llm_service=get_llm_service(),
        ),
        estimate_materials=EstimateMaterials(
            prompt_service=get_prompt_service(),
            llm_service=get_llm_service(),
        ),
    )
