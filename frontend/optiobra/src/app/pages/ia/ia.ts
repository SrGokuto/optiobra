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

  imprimirReporte(): void {
    if (!this.reporteHtml || !this.proyectoId) return;
    const proyecto = this.proyectos.find((item) => item.id === this.proyectoId);
    const ventana = window.open('', '_blank', 'width=900,height=700');
    if (!ventana) return;
    ventana.onload = () => {
      ventana.focus();
      ventana.print();
    };
    ventana.document.write(`<!doctype html><html><head><title>Reporte IA - OptiObra</title><style>
      body{font-family:Arial,sans-serif;color:#1f2937;margin:40px;line-height:1.5}
      header{border-bottom:3px solid #f29f05;padding-bottom:18px;margin-bottom:24px;display:flex;align-items:center;gap:18px}
      header img{width:90px;height:auto} h1{color:#0d1b2a;margin:0;font-size:24px} h2{color:#0d1b2a}
      .meta{color:#6b7280;font-size:13px}.reporte h1,.reporte h2,.reporte h3{color:#0d1b2a}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #d1d5db;padding:8px;text-align:left}th{background:#fef3c7}
      @media print{body{margin:18mm}}
    </style></head><body><header><img src="${window.location.origin}/assets/Logo.png" alt="OptiObra"><div><h1>OPTIOBRA - REPORTE IA</h1><div class="meta">Proyecto: ${proyecto?.nombre || 'Sin proyecto'} | Generado: ${new Date().toLocaleString('es-CO')}</div></div></header><main class="reporte">${this.reporteHtml}</main></body></html>`);
    ventana.document.close();
  }
}