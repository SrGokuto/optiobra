import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { ReporteService } from '../../../Services/reporte.service';
import { ReporteProyectos, ReporteInventario, ReporteTrabajadores } from '../../../Models/reporte';
import { Proyecto } from '../../../Models/proyecto';
import { Chart, registerables } from 'chart.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

Chart.register(...registerables);

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss']
})
export class ReportesComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('barChartCanvas') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChartCanvas') pieChartRef!: ElementRef<HTMLCanvasElement>;

  menuAbierto = true;
  cargando = false;
error = '';

  mostrarExito = false;

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
  valorInventario: number | null = null;
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

  get hayDatosProyectos(): boolean {
    return !!(this.datosProyectos?.proyectos?.length);
  }

  get hayDatosCategorias(): boolean {
    return !!(this.datosInventario?.desglose_categorias?.some((c) => c.total_items > 0));
  }

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarProyectos();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderizarGraficas(), 0);
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
    this.error = '';
    this.valorInventario = null;
    this.totalProyectos = 0;
    this.totalTrabajadores = 0;
    this.avancePromedio = 0;
    this.reportesCargados = { inventario: false, trabajadores: false, proyectos: false };
    this.datosInventario = null;
    this.datosProyectos = null;

    this.reporteService.getInventario().subscribe({
      next: (data) => {
        this.valorInventario = data.valor_total_inventario;
        this.datosInventario = data;
        this.reportesCargados.inventario = true;
        this.verificarCargaCompleta();
      },
      error: (err) => {
        this.error = 'No se pudo cargar el valor del inventario desde la base de datos';
        console.error('Error inventario:', err);
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
      error: (err) => {
        this.error = 'No se pudieron cargar los trabajadores';
        console.error('Error trabajadores:', err);
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
      error: (err) => {
        this.error = 'No se pudieron cargar los proyectos';
        console.error('Error proyectos:', err);
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
    if (!this.barChartRef?.nativeElement) return;

    this.barChart?.destroy();
    this.barChart = null;

    const proyectos = this.datosProyectos?.proyectos || [];
    if (!proyectos.length) return;

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
    if (!this.pieChartRef?.nativeElement) return;

    this.pieChart?.destroy();
    this.pieChart = null;

    const categorias = (this.datosInventario?.desglose_categorias || []).filter(c => c.total_items > 0);
    if (!categorias.length) return;

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

  onCambiarTipoReporte(): void {
    if (this.tipoReporte === 'inventario') {
      this.reporteService.getInventario().subscribe({
        next: (data) => {
          this.valorInventario = data.valor_total_inventario;
          this.datosInventario = data;
        },
        error: (err) => {
          this.error = 'No se pudo cargar el valor del inventario desde la base de datos';
          console.error('Error al cargar inventario:', err);
        }
      });
    }
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

  formatearPresupuesto(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '-';
    const numero = Number(valor);
    if (Number.isNaN(numero)) return '-';
    if (numero >= 1000000) {
      return `$${(numero / 1000000).toFixed(0)} M`;
    }
    return `$${numero.toLocaleString('es-CO')}`;
  }

  generarReporte(): void {
    console.log('Generando reporte...');
    console.log({
      tipo: this.tipoReporte,
      proyecto: this.proyecto,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    });
    this.mostrarExito = true;
  }

  exportarPDF(): void {
    const doc = new jsPDF();
    const yFinal = (): number => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

    doc.setFillColor(13, 27, 42);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('OPTIOBRA', 14, 14);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Reporte General del Sistema', 14, 22);
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 27);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen', 14, 42);

    autoTable(doc, {
      startY: 47,
      head: [['Métrica', 'Valor']],
      body: [
        ['Proyectos', String(this.totalProyectos)],
        ['Trabajadores', String(this.totalTrabajadores)],
        ['Valor del inventario', this.formatearPresupuesto(this.valorInventario)],
        ['Avance promedio', `${this.avancePromedio}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [242, 159, 5], textColor: [0, 0, 0] },
    });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Avance por Proyecto', 14, yFinal() + 12);

    const proyectos = this.datosProyectos?.proyectos || [];
    if (proyectos.length) {
      autoTable(doc, {
        startY: yFinal() + 17,
        head: [['Nombre', 'Ubicación', 'Estado', 'Avance (%)']],
        body: proyectos.map((p) => [
          p.nombre,
          p.ubicacion || '-',
          p.estado,
          String(p.porcentaje_avance),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [242, 159, 5], textColor: [0, 0, 0] },
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120, 120, 120);
      doc.text('No hay proyectos registrados', 14, yFinal() + 17);
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Distribución de Recursos', 14, yFinal() + 12);

    const categorias = (this.datosInventario?.desglose_categorias || []).filter((c) => c.total_items > 0);
    if (categorias.length) {
      autoTable(doc, {
        startY: yFinal() + 17,
        head: [['Categoría', 'Items', 'Valor']],
        body: categorias.map((c) => [c.nombre, String(c.total_items), this.formatearPresupuesto(c.valor_categoria)]),
        theme: 'striped',
        headStyles: { fillColor: [242, 159, 5], textColor: [0, 0, 0] },
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120, 120, 120);
      doc.text('No hay materiales con stock', 14, yFinal() + 17);
    }

    doc.save('reporte-optiobra.pdf');
  }

  exportarExcel(): void {
    const resumen = [
      { Metrica: 'Proyectos', Valor: this.totalProyectos },
      { Metrica: 'Trabajadores', Valor: this.totalTrabajadores },
      { Metrica: 'Valor del inventario', Valor: this.valorInventario ?? 0 },
      { Metrica: 'Avance promedio (%)', Valor: this.avancePromedio },
    ];

    const proyectos = (this.datosProyectos?.proyectos || []).map((p) => ({
      Nombre: p.nombre,
      Ubicacion: p.ubicacion || '-',
      Estado: p.estado,
      'Avance (%)': p.porcentaje_avance,
      'Total tareas': p.total_tareas,
      'Fecha inicio': p.fecha_inicio || '-',
      'Fecha fin': p.fecha_fin || '-',
    }));

    const categorias = (this.datosInventario?.desglose_categorias || []).map((c) => ({
      Categoria: c.nombre,
      Items: c.total_items,
      Valor: c.valor_categoria,
    }));

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(resumen), 'Resumen');
    XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(proyectos), 'Avance por Proyecto');
    XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(categorias), 'Distribución Recursos');

    XLSX.writeFile(libro, 'reporte-optiobra.xlsx');
  }

}
