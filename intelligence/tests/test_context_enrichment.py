"""Tests for context enrichment pipeline."""

from __future__ import annotations

import pytest

from app.application.services.context_service import ContextService
from app.domain.analysis.project_analyzer import ProjectAnalyzer
from app.domain.analysis.material_analyzer import MaterialAnalyzer
from app.domain.analysis.progress_analyzer import ProgressAnalyzer
from app.domain.analysis.timeline_analyzer import TimelineAnalyzer
from app.domain.analysis.statistics_analyzer import StatisticsAnalyzer
from app.domain.analysis.alert_analyzer import AlertAnalyzer
from app.domain.analysis.recommendation_analyzer import RecommendationAnalyzer
from app.domain.analysis.plugin_manager import PluginManager


class TestContextService:
    def test_enrich_minimal_request(self, minimal_request):
        service = ContextService()
        enriched = service.enrich(minimal_request)
        assert enriched.project["name"] == "Hospital Norte"
        assert enriched.activities == []

    def test_enrich_full_request(self, sample_request):
        service = ContextService()
        enriched = service.enrich(sample_request)
        assert len(enriched.activities) == 2
        assert len(enriched.materials) == 2
        assert enriched.statistics["total_progress"] == 65

    def test_materials_normalized(self, sample_request):
        service = ContextService()
        enriched = service.enrich(sample_request)
        cemento = next(m for m in enriched.materials if m["material"] == "Cemento")
        assert cemento["difference"] == -140

    def test_activities_sorted_by_date(self, sample_request):
        service = ContextService()
        enriched = service.enrich(sample_request)
        dates = [a["date"] for a in enriched.activities]
        assert dates == sorted(dates)

    def test_statistics_computed(self, sample_request):
        service = ContextService()
        enriched = service.enrich(sample_request)
        assert enriched.statistics["activities_count"] == 12
        assert enriched.statistics["critical_materials"] == 2

    def test_alerts_generated(self, sample_request):
        service = ContextService()
        enriched = service.enrich(sample_request)
        assert len(enriched.alerts) > 0

    def test_timeline_built(self, sample_request):
        service = ContextService()
        enriched = service.enrich(sample_request)
        assert len(enriched.timeline) >= 0


class TestProjectAnalyzer:
    def test_analyze_behind_schedule(self):
        analyzer = ProjectAnalyzer()
        context = {
            "project": {"current_progress": 50, "planned_progress": 70},
            "activities": [],
        }
        result = analyzer.analyze(context)
        assert result.findings["is_behind_schedule"] is True
        assert result.findings["deviation"] == -20

    def test_analyze_on_track(self):
        analyzer = ProjectAnalyzer()
        context = {
            "project": {"current_progress": 70, "planned_progress": 70},
            "activities": [],
        }
        result = analyzer.analyze(context)
        assert result.findings["is_behind_schedule"] is False

    def test_no_activities_recommendation(self):
        analyzer = ProjectAnalyzer()
        context = {
            "project": {"current_progress": 50, "planned_progress": 50},
            "activities": [],
        }
        result = analyzer.analyze(context)
        assert any("actividades" in r.lower() for r in result.recommendations)


class TestMaterialAnalyzer:
    def test_critical_materials(self):
        analyzer = MaterialAnalyzer()
        context = {
            "materials": [
                {"material": "Arena", "current_quantity": 50, "previous_quantity": 300, "difference": -250, "critical": True},
                {"material": "Cemento", "current_quantity": 200, "previous_quantity": 250, "difference": -50, "critical": False},
            ]
        }
        result = analyzer.analyze(context)
        assert result.statistics["critical_count"] == 1

    def test_low_stock_detection(self):
        analyzer = MaterialAnalyzer()
        context = {
            "materials": [
                {"material": "Arena", "current_quantity": 50, "previous_quantity": 300, "difference": -250, "critical": True},
            ]
        }
        result = analyzer.analyze(context)
        assert result.statistics["low_stock_count"] == 1
        assert len(result.alerts) > 0


class TestProgressAnalyzer:
    def test_positive_trend(self):
        analyzer = ProgressAnalyzer()
        context = {
            "activities": [
                {"progress_after": 60},
                {"progress_after": 63},
                {"progress_after": 65},
                {"progress_after": 68},
            ],
            "project": {"current_progress": 68, "planned_progress": 70},
        }
        result = analyzer.analyze(context)
        assert result.findings["trend"] == "positive"

    def test_stagnation_detection(self):
        analyzer = ProgressAnalyzer()
        context = {
            "activities": [{"progress_after": 65}] * 10,
            "project": {"current_progress": 65, "planned_progress": 70},
        }
        result = analyzer.analyze(context)
        assert result.findings["is_stagnant"] is True


class TestTimelineAnalyzer:
    def test_events_sorted(self):
        analyzer = TimelineAnalyzer()
        context = {
            "activities": [
                {"date": "2026-08-03", "activity": "Montaje"},
                {"date": "2026-08-01", "activity": "Fundicion"},
            ],
            "materials": [],
            "timeline": [],
        }
        result = analyzer.analyze(context)
        assert result.findings["total_events"] == 2

    def test_duplicates_removed(self):
        analyzer = TimelineAnalyzer()
        context = {
            "activities": [
                {"date": "2026-08-01", "activity": "Fundicion"},
                {"date": "2026-08-01", "activity": "Fundicion"},
            ],
            "materials": [],
            "timeline": [],
        }
        result = analyzer.analyze(context)
        assert result.findings["total_events"] == 1


class TestStatisticsAnalyzer:
    def test_computes_statistics(self):
        analyzer = StatisticsAnalyzer()
        context = {
            "activities": [
                {"progress_after": 60, "responsible": "Carlos"},
                {"progress_after": 65, "responsible": "Maria"},
            ],
            "materials": [
                {"critical": True, "difference": -100, "category": "Construccion"},
            ],
            "project": {"current_progress": 65, "planned_progress": 70},
            "statistics": {},
        }
        result = analyzer.analyze(context)
        assert result.statistics["current_progress"] == 65
        assert result.statistics["deviation"] == -5


class TestAlertAnalyzer:
    def test_low_stock_alert(self):
        analyzer = AlertAnalyzer()
        context = {
            "project": {"current_progress": 65, "planned_progress": 70},
            "materials": [
                {"material": "Arena", "current_quantity": 50, "previous_quantity": 300},
            ],
            "activities": [{"date": "2026-08-01"}],
        }
        result = analyzer.analyze(context)
        assert any(a["type"] == "LOW_STOCK" for a in result.alerts)

    def test_delay_alert(self):
        analyzer = AlertAnalyzer()
        context = {
            "project": {"current_progress": 50, "planned_progress": 70},
            "materials": [],
            "activities": [{"date": "2026-08-01"}],
        }
        result = analyzer.analyze(context)
        assert any(a["type"] == "DELAY" for a in result.alerts)

    def test_no_activity_alert(self):
        analyzer = AlertAnalyzer()
        context = {
            "project": {"current_progress": 65, "planned_progress": 70},
            "materials": [],
            "activities": [],
        }
        result = analyzer.analyze(context)
        assert any(a["type"] == "NO_ACTIVITY" for a in result.alerts)


class TestRecommendationAnalyzer:
    def test_material_recommendations(self):
        analyzer = RecommendationAnalyzer()
        context = {
            "project": {"current_progress": 65, "planned_progress": 70},
            "materials": [
                {"material": "Arena", "current_quantity": 50, "critical": True},
            ],
            "activities": [{"date": "2026-08-01"}],
        }
        result = analyzer.analyze(context)
        assert len(result.recommendations) > 0

    def test_no_activities_recommendation(self):
        analyzer = RecommendationAnalyzer()
        context = {
            "project": {"current_progress": 65, "planned_progress": 70},
            "materials": [],
            "activities": [],
        }
        result = analyzer.analyze(context)
        assert any("actividades" in r.lower() for r in result.recommendations)


class TestPluginManager:
    def test_execute_all_plugins(self):
        manager = PluginManager()
        manager.register_all([
            ProjectAnalyzer(),
            MaterialAnalyzer(),
            ProgressAnalyzer(),
        ])
        context = {
            "project": {"current_progress": 65, "planned_progress": 70},
            "activities": [{"progress_after": 65}],
            "materials": [{"material": "Test", "current_quantity": 50, "previous_quantity": 200, "difference": -150, "critical": True}],
        }
        result = manager.execute(context)
        assert "project_analysis" in result
        assert "material_analysis" in result
        assert "_summary" in result
