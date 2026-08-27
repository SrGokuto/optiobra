import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { ProyectoService } from '../../../Services/proyecto.service';
import { IaService } from '../../../Services/ia.service';
import { Proyecto } from '../../../Models/proyecto';
import { EstimacionIA } from '../../../Models/estimacion';

@Component({
  selector: 'app-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './ia.html',
  styleUrls: ['./ia.scss'],
})
export class IaComponent implements OnInit {
  menuAbierto = true;
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
          this.reporteHtml = this.renderizarMarkdown(res.report);
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

  renderizarMarkdown(markdown: string): string {
    const html = marked.parse(markdown, { async: false }) as string;
    return DOMPurify.sanitize(html);
  }
}