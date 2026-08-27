import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { AsistenteProyectosComponent } from './asistente/asistente-proyectos';
import { ProyectoService } from '../../../Services/proyecto.service';
import { IaService } from '../../../Services/ia.service';
import { Proyecto } from '../../../Models/proyecto';
import { EstimacionIA } from '../../../Models/estimacion';
import { renderizarMarkdown } from '../../../utils/markdown';

type ModuloIA = 'reportes' | 'asistente';

@Component({
  selector: 'app-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, AsistenteProyectosComponent],
  templateUrl: './ia.html',
  styleUrls: ['./ia.scss'],
})
export class IaComponent implements OnInit {
  menuAbierto = true;
  modulo: ModuloIA = 'reportes';
  cargandoProyectos = false;
  generando = false;
  error = '';

  proyectos: Proyecto[] = [];
  proyectoId: number | null = null;

  resultado: EstimacionIA | null = null;
  reporteHtml = '';

  constructor(
    private proyectoService: ProyectoService,
    private iaService: IaService
  ) {}

  ngOnInit(): void {
    this.cargarProyectos();
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cambiarModulo(modulo: ModuloIA): void {
    this.modulo = modulo;
    this.error = '';
  }

  cargarProyectos(): void {
    this.cargandoProyectos = true;
    this.error = '';
    this.proyectoService.getProyectos().subscribe({
      next: (respuesta) => {
        this.proyectos = respuesta.results || [];
        this.cargandoProyectos = false;
      },
      error: (err) => {
        this.cargandoProyectos = false;
        this.error = 'No se pudieron cargar los proyectos';
        console.error('Error cargando proyectos:', err);
      },
    });
  }

  generar(): void {
    if (!this.proyectoId) {
      return;
    }
    this.generando = true;
    this.error = '';
    this.resultado = null;
    this.reporteHtml = '';

    this.iaService.generarResumenEjecutivo(this.proyectoId).subscribe({
      next: (res) => {
        this.generando = false;
        this.resultado = res;
        if (res.success && res.report) {
          this.reporteHtml = renderizarMarkdown(res.report);
        } else {
          this.error = res.message || 'El motor no pudo generar el resumen ejecutivo';
        }
      },
      error: (err) => {
        this.generando = false;
        this.error = 'No se pudo generar el resumen. Verifica que el motor de inteligencia esté disponible.';
        console.error('Error generando resumen IA:', err);
      },
    });
  }

  formatearDuracion(ms?: number): string {
    if (ms === undefined || ms === null) {
      return '-';
    }
    return `${(ms / 1000).toFixed(2)} s`;
  }
}