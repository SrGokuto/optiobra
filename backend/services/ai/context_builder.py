from __future__ import annotations

import logging
from datetime import date, datetime
from typing import Any

from django.db.models import Avg, Count, Q

from api.models import Proyecto, AvanceObra, Material, HistorialMaterial

logger = logging.getLogger(__name__)

LOW_STOCK_THRESHOLD = 100
HIGH_CONSUMPTION_RATE = 0.30


class ContextBuilder:
    """Builds the JSON context for the Intelligence Engine.

    Queries Django models, computes statistics, and returns clean JSON.
    No Django objects are exposed to the intelligence engine.
    """

    def build_project_context(self, proyecto_id: int) -> dict[str, Any]:
        """Build complete context for a project."""
        proyecto = Proyecto.objects.get(id=proyecto_id)

        activities = self._build_activities(proyecto)
        materials = self._build_materials()
        statistics = self._compute_statistics(proyecto, activities, materials)
        alerts = self._generate_alerts(proyecto, materials, activities)
        timeline = self._build_timeline(activities, materials)
        metadata = self._build_metadata(proyecto)

        return {
            "project": self._serialize_project(proyecto),
            "activities": activities,
            "materials": materials,
            "statistics": statistics,
            "alerts": alerts,
            "timeline": timeline,
            "metadata": metadata,
        }

    def _serialize_project(self, proyecto: Proyecto) -> dict[str, Any]:
        return {
            "id": proyecto.id,
            "name": proyecto.nombre,
            "description": proyecto.descripcion or "",
            "location": proyecto.ubicacion,
            "address": proyecto.direccion or "",
            "responsible": proyecto.responsable or "",
            "budget": str(proyecto.presupuesto) if proyecto.presupuesto is not None else "",
            "status": proyecto.estado,
            "current_progress": proyecto.porcentaje_avance,
            "planned_progress": self._calculate_planned_progress(proyecto),
            "start_date": proyecto.fecha_inicio.isoformat() if proyecto.fecha_inicio else "",
            "planned_finish": proyecto.fecha_fin_estimada.isoformat() if proyecto.fecha_fin_estimada else "",
            "estimated_finish": proyecto.fecha_fin.isoformat() if proyecto.fecha_fin else "",
            "last_update": proyecto.actualizado_en.isoformat() if proyecto.actualizado_en else "",
        }

    def _calculate_planned_progress(self, proyecto: Proyecto) -> int:
        """Calculate planned progress based on dates."""
        if not proyecto.fecha_inicio or not proyecto.fecha_fin:
            return proyecto.porcentaje_avance
        today = date.today()
        total_days = (proyecto.fecha_fin - proyecto.fecha_inicio).days
        elapsed_days = (today - proyecto.fecha_inicio).days
        if total_days <= 0:
            return 100
        return min(100, max(0, int((elapsed_days / total_days) * 100)))

    def _build_activities(self, proyecto: Proyecto) -> list[dict[str, Any]]:
        """Build activities list from AvanceObra."""
        avances = AvanceObra.objects.filter(
            proyecto=proyecto
        ).order_by("fecha")[:50]

        activities = []
        for i, avance in enumerate(avances):
            prev_progress = avances[i - 1].porcentaje if i > 0 else 0
            activities.append({
                "date": avance.fecha.isoformat(),
                "activity": avance.actividad,
                "description": avance.descripcion or "",
                "responsible": avance.responsable,
                "progress_before": prev_progress,
                "progress_after": avance.porcentaje,
            })
        return activities

    def _build_materials(self) -> list[dict[str, Any]]:
        """Build materials list with consumption calculations."""
        materiales = Material.objects.filter(estado="disponible")
        materials = []

        for material in materiales:
            historial = HistorialMaterial.objects.filter(
                material=material,
                accion="cambio_cantidad",
            ).order_by("-fecha").first()

            prev_quantity = 0
            if historial and historial.valores_anteriores:
                prev_quantity = historial.valores_anteriores.get("cantidad", material.cantidad)

            difference = material.cantidad - prev_quantity
            critical = self._is_material_critical(material.cantidad, prev_quantity)

            materials.append({
                "material": material.nombre,
                "category": material.categoria.nombre if material.categoria else "",
                "previous_quantity": prev_quantity,
                "current_quantity": material.cantidad,
                "difference": difference,
                "critical": critical,
            })
        return materials

    def _is_material_critical(self, current: int, previous: int) -> bool:
        if current < LOW_STOCK_THRESHOLD:
            return True
        if previous > 0:
            consumption_rate = abs(previous - current) / previous
            if consumption_rate > HIGH_CONSUMPTION_RATE:
                return True
        return False

    def _compute_statistics(
        self,
        proyecto: Proyecto,
        activities: list[dict[str, Any]],
        materials: list[dict[str, Any]],
    ) -> dict[str, Any]:
        avg_progress = AvanceObra.objects.filter(
            proyecto=proyecto
        ).aggregate(avg=Avg("porcentaje"))["avg"] or 0

        return {
            "activities_count": len(activities),
            "material_changes": len(materials),
            "critical_materials": sum(1 for m in materials if m.get("critical")),
            "average_progress": round(avg_progress, 1),
            "total_progress": proyecto.porcentaje_avance,
        }

    def _generate_alerts(
        self,
        proyecto: Proyecto,
        materials: list[dict[str, Any]],
        activities: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        alerts = []

        for m in materials:
            if m.get("critical"):
                if m["current_quantity"] < LOW_STOCK_THRESHOLD:
                    alerts.append({
                        "type": "LOW_STOCK",
                        "message": f"{m['material']} por debajo del minimo ({m['current_quantity']} unidades)",
                        "severity": "high",
                    })
                else:
                    alerts.append({
                        "type": "EXCESSIVE_CONSUMPTION",
                        "message": f"{m['material']} con consumo elevado",
                        "severity": "medium",
                    })

        current = proyecto.porcentaje_avance
        planned = self._calculate_planned_progress(proyecto)
        if planned > 0 and (planned - current) > 10:
            alerts.append({
                "type": "DELAY",
                "message": f"Proyecto con retraso: {current}% vs {planned}% planificado",
                "severity": "high",
            })

        if not activities:
            alerts.append({
                "type": "NO_ACTIVITY",
                "message": "No se registraron actividades recientes",
                "severity": "medium",
            })

        return alerts

    def _build_timeline(
        self,
        activities: list[dict[str, Any]],
        materials: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        events = []
        for a in activities:
            events.append({
                "date": a["date"],
                "event": a["activity"],
                "type": "activity",
            })
        for m in materials:
            if m.get("difference", 0) != 0:
                events.append({
                    "date": "",
                    "event": f"Cambio en {m['material']}: {m['difference']}",
                    "type": "material",
                })
        events.sort(key=lambda x: x.get("date", ""))
        return events

    def _build_metadata(self, proyecto: Proyecto) -> dict[str, Any]:
        return {
            "generated_at": datetime.now().isoformat(),
            "language": "es",
            "report_type": "executive",
            "timezone": "America/Bogota",
        }
