import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { ReporteService } from '../../../Services/reporte.service';
import { ReporteProyectos, ReporteInventario, ReporteTrabajadores } from '../../../Models/reporte';
import { Proyecto } from '../../../Models/proyecto';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss']
})
export class ReportesComponent implements OnInit, OnDestroy {

  @ViewChild('barChartCanvas') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChartCanvas') pieChartRef!: ElementRef<HTMLCanvasElement>;

  menuAbierto = true;
  cargando = false;
  error = '';

  tipoReporte: string = '';
  proyecto: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  tiposReporte: string[] = [
    'inventario',
    'stock_bajo',
    'proyectos',
    'trabajadores'
  ];

  proyectos: Proyecto[] = [];

  totalProyectos: number = 0;
  totalTrabajadores: number = 0;
  valorInventario: number = 0;
  avancePromedio: number = 0;

  private barChart: Chart | null = null;
  private pieChart: Chart | null = null;

  private reportesCargados = {
    inventario: false,
    trabajadores: false,
    proyectos: false
  };

  private datosProyectos: ReporteProyectos | null = null;
  private datosInventario: ReporteInventario | null = null;

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarProyectos();
  }

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.pieChart?.destroy();
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarEstadisticas(): void {
    this.cargando = true;

    this.reporteService.getInventario().subscribe({
      next: (data) => {
        this.valorInventario = data.valor_total_inventario;
        this.datosInventario = data;
        this.reportesCargados.inventario = true;
        this.verificarCargaCompleta();
      },
      error: () => {
        this.reportesCargados.inventario = true;
        this.verificarCargaCompleta();
      }
    });

    this.reporteService.getTrabajadores().subscribe({
      next: (data) => {
        this.totalTrabajadores = data.total_trabajadores;
        this.reportesCargados.trabajadores = true;
        this.verificarCargaCompleta();
      },
      error: () => {
        this.reportesCargados.trabajadores = true;
        this.verificarCargaCompleta();
      }
    });

    this.reporteService.getProyectos().subscribe({
      next: (data) => {
        this.totalProyectos = data.total_proyectos;
        this.avancePromedio = data.promedio_avance_general;
        this.datosProyectos = data;
        this.reportesCargados.proyectos = true;
        this.verificarCargaCompleta();
      },
      error: () => {
        this.reportesCargados.proyectos = true;
        this.verificarCargaCompleta();
      }
    });
  }

  private verificarCargaCompleta(): void {
    if (this.reportesCargados.inventario && this.reportesCargados.trabajadores && this.reportesCargados.proyectos) {
      this.cargando = false;
      setTimeout(() => this.renderizarGraficas(), 0);
    }
  }

  private renderizarGraficas(): void {
    this.renderizarGraficaBarras();
    this.renderizarGraficaCircular();
  }

  private renderizarGraficaBarras(): void {
    if (!this.barChartRef?.nativeElement || !this.datosProyectos?.proyectos?.length) return;

    this.barChart?.destroy();

    const proyectos = this.datosProyectos.proyectos;
    const labels = proyectos.map(p => p.nombre);
    const datos = proyectos.map(p => p.porcentaje_avance);

    this.barChart = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Avance (%)',
          data: datos,
          backgroundColor: '#0d6efd',
          borderColor: '#0b5ed7',
          borderWidth: 1,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.parsed.y}%`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0
            }
          }
        }
      }
    });
  }

  private renderizarGraficaCircular(): void {
    if (!this.pieChartRef?.nativeElement || !this.datosInventario?.desglose_categorias?.length) return;

    this.pieChart?.destroy();

    const categorias = this.datosInventario.desglose_categorias;
    const labels = categorias.map(c => c.nombre);
    const datos = categorias.map(c => c.total_items);

    const colores = [
      '#0d6efd', '#198754', '#ffc107', '#dc3545',
      '#6f42c1', '#fd7e14', '#20c997', '#d63384'
    ];

    this.pieChart = new Chart(this.pieChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: datos,
          backgroundColor: colores.slice(0, categorias.length),
          borderWidth: 2,
          borderColor: '#fff',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const porcentaje = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
                return `${ctx.label}: ${ctx.parsed} items (${porcentaje}%)`;
              }
            }
          }
        }
      }
    });
  }

  cargarProyectos(): void {
    this.reporteService.getProyectosParaFiltro().subscribe({
      next: (respuesta) => {
        this.proyectos = respuesta.results || [];
      },
      error: () => {}
    });
  }

  formatearTipoReporte(tipo: string): string {
    const mapa: Record<string, string> = {
      'inventario': 'Inventario',
      'stock_bajo': 'Stock Bajo',
      'proyectos': 'Proyectos',
      'trabajadores': 'Trabajadores'
    };
    return mapa[tipo] || tipo;
  }

  formatearPresupuesto(valor: number): string {
    if (valor >= 1000000) {
      return `$${(valor / 1000000).toFixed(0)} M`;
    }
    return `$${valor.toLocaleString()}`;
  }

  generarReporte(): void {
    console.log('Generando reporte...');
    console.log({
      tipo: this.tipoReporte,
      proyecto: this.proyecto,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    });
    alert('Reporte generado correctamente.');
  }

  exportarPDF(): void {
    alert('Exportando reporte en PDF...');
  }

  exportarExcel(): void {
    alert('Exportando reporte en Excel...');
  }

}
