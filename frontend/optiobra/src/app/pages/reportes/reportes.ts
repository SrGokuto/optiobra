import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { ReporteService } from '../../../Services/reporte.service';
import { ReporteProyectos, ReporteInventario, ReporteTrabajadores, ReporteStockBajo } from '../../../Models/reporte';
import { Proyecto } from '../../../Models/proyecto';
import { Chart, registerables } from 'chart.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

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
    proyectos: false,
    stockBajo: false,
  };

  private datosProyectos: ReporteProyectos | null = null;
  private datosInventario: ReporteInventario | null = null;
  private datosTrabajadores: ReporteTrabajadores | null = null;
  private datosStockBajo: ReporteStockBajo | null = null;

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
    this.reportesCargados = { inventario: false, trabajadores: false, proyectos: false, stockBajo: false };
    this.datosInventario = null;
    this.datosProyectos = null;
    this.datosTrabajadores = null;
    this.datosStockBajo = null;

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
        this.datosTrabajadores = data;
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

    this.reporteService.getStockBajo().subscribe({
      next: (data) => {
        this.datosStockBajo = data;
        this.reportesCargados.stockBajo = true;
        this.verificarCargaCompleta();
      },
      error: (err) => {
        console.error('Error stock bajo:', err);
        this.reportesCargados.stockBajo = true;
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
    if (this.reportesCargados.inventario && this.reportesCargados.trabajadores && this.reportesCargados.proyectos && this.reportesCargados.stockBajo) {
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

  async exportarPDF(): Promise<void> {
    const doc = new jsPDF();
    const yFinal = (): number => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    const logoDataUrl = await this.cargarLogoDataUrl();

    doc.setFillColor(13, 27, 42);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('OPTIOBRA', 14, 14);
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 174, 4, 22, 22);
    }
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

  async exportarExcel(): Promise<void> {
    if (this.cargando) {
      this.error = 'Espera a que terminen de cargar los datos antes de exportar';
      return;
    }

    const libro = new ExcelJS.Workbook();
    libro.creator = 'OptiObra';
    libro.title = 'OptiObra - Reportes';
    libro.subject = 'Informe consolidado del sistema OptiObra';
    libro.created = new Date();

    const portada = libro.addWorksheet('Portada');
    portada.columns = [{ width: 34 }, { width: 70 }, { width: 18 }];
    portada.mergeCells('A1:B1');
    portada.getCell('A1').value = 'OPTIOBRA - REPORTES';
    portada.getCell('A1').font = { bold: true, size: 20, color: { argb: 'FFFFFFFF' } };
    portada.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D1B2A' } };
    portada.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    portada.getRow(1).height = 34;
    portada.mergeCells('A2:B2');
    portada.getCell('A2').value = 'Informe consolidado con datos reales del sistema';
    portada.getCell('A2').font = { italic: true, size: 12, color: { argb: 'FF4B5563' } };
    portada.mergeCells('A4:B4');
    portada.getCell('A4').value = 'DESCRIPCIÓN';
    portada.getCell('A4').font = { bold: true, color: { argb: 'FFFFFFFF' } };
    portada.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF29F05' } };
    portada.mergeCells('A5:B6');
    portada.getCell('A5').value = 'Este archivo reúne información calculada desde la base de datos: proyectos, avance de obra, inventario, materiales con stock bajo y trabajadores.';
    portada.getCell('A5').alignment = { wrapText: true, vertical: 'top' };
    portada.getCell('A8').value = 'Generado';
    portada.getCell('B8').value = new Date().toLocaleString('es-CO');
    portada.getCell('A9').value = 'Logo oficial';
    portada.getCell('B9').value = 'OptiObra';
    portada.getCell('A11').value = 'FILTROS SELECCIONADOS';
    portada.getCell('A11').font = { bold: true };
    portada.getCell('A12').value = 'Tipo de reporte';
    portada.getCell('B12').value = this.tipoReporte ? this.formatearTipoReporte(this.tipoReporte) : 'Todos';
    portada.getCell('A13').value = 'Proyecto';
    portada.getCell('B13').value = this.nombreProyectoSeleccionado();
    portada.getCell('A14').value = 'Periodo';
    portada.getCell('B14').value = this.fechaInicio || this.fechaFin ? `${this.fechaInicio || '-'} a ${this.fechaFin || '-'}` : 'Todos';
    portada.getColumn(1).eachCell((cell) => { cell.font = { ...cell.font, bold: true }; });

    const logoResponse = await fetch('assets/Logo.png');
    if (logoResponse.ok) {
      const logoBuffer = await logoResponse.arrayBuffer();
      const logoId = libro.addImage({ buffer: logoBuffer, extension: 'png' });
      portada.addImage(logoId, { tl: { col: 2, row: 0 }, ext: { width: 100, height: 70 } });
    }

    this.agregarHojaExcel(libro, 'Resumen', [
      ['MÉTRICA', 'VALOR', 'DESCRIPCIÓN'],
      ['Proyectos', this.totalProyectos, 'Cantidad total de proyectos registrados'],
      ['Trabajadores', this.totalTrabajadores, 'Cantidad total de trabajadores registrados'],
      ['Valor del inventario', this.valorInventario ?? '', 'Valor total calculado desde los materiales'],
      ['Avance promedio (%)', this.avancePromedio, 'Promedio general de avance de proyectos'],
    ], [28, 18, 65]);
    this.agregarHojaExcel(libro, 'Proyectos', [
      ['ID', 'NOMBRE', 'UBICACIÓN', 'ESTADO', 'AVANCE (%)', 'TOTAL TAREAS', 'FECHA INICIO', 'FECHA FIN'],
      ...(this.datosProyectos?.proyectos || []).map((p) => [p.id, p.nombre, p.ubicacion || '-', p.estado, p.porcentaje_avance, p.total_tareas, p.fecha_inicio || '-', p.fecha_fin || '-']),
    ], [10, 30, 25, 18, 15, 15, 16, 16]);
    this.agregarHojaExcel(libro, 'Stock Bajo', [
      ['ID', 'NOMBRE', 'CÓDIGO', 'CATEGORÍA', 'CANTIDAD', 'PRECIO', 'ESTADO'],
      ...(this.datosStockBajo?.materiales || []).map((m) => [m.id, m.nombre, m.codigo, m.categoria, m.cantidad, m.precio, m.estado]),
    ], [10, 30, 18, 24, 14, 18, 18]);
    this.agregarHojaExcel(libro, 'Inventario', [
      ['CATEGORÍA', 'TOTAL ITEMS', 'VALOR'],
      ...(this.datosInventario?.desglose_categorias || []).map((c) => [c.nombre, c.total_items, c.valor_categoria]),
    ], [30, 18, 20]);
    this.agregarHojaExcel(libro, 'Trabajadores', [
      ['ROL', 'TOTAL'],
      ...(this.datosTrabajadores?.distribucion_por_rol || []).map((r) => [r.rol, r.total]),
      [],
      ['TOTAL TRABAJADORES', this.totalTrabajadores],
      ['ACTIVOS', this.datosTrabajadores?.activos ?? ''],
      ['INACTIVOS', this.datosTrabajadores?.inactivos ?? ''],
    ], [30, 18]);

    const buffer = await libro.xlsx.writeBuffer();
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    enlace.download = `optiobra-reportes-${new Date().toISOString().slice(0, 10)}.xlsx`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  private agregarHojaExcel(libro: ExcelJS.Workbook, nombre: string, filas: unknown[][], anchos: number[]): void {
    const hoja = libro.addWorksheet(nombre);
    hoja.columns = anchos.map((width) => ({ width }));
    filas.forEach((fila) => hoja.addRow(fila));
    const encabezado = hoja.getRow(1);
    encabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    encabezado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D1B2A' } };
    encabezado.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    encabezado.height = 24;
    hoja.views = [{ state: 'frozen', ySplit: 1 }];
    hoja.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + anchos.length)}${Math.max(1, filas.length)}` };
    hoja.eachRow((row, index) => {
      if (index > 1 && index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F9FC' } };
      }
    });
  }

  private nombreProyectoSeleccionado(): string {
    if (!this.proyecto) return 'Todos';
    return this.proyectos.find((p) => String(p.id) === String(this.proyecto))?.nombre || this.proyecto;
  }

  private async cargarLogoDataUrl(): Promise<string | null> {
    const respuesta = await fetch('assets/Logo.png');
    if (!respuesta.ok) return null;
    const blob = await respuesta.blob();
    return new Promise((resolve) => {
      const lector = new FileReader();
      lector.onload = () => resolve(typeof lector.result === 'string' ? lector.result : null);
      lector.onerror = () => resolve(null);
      lector.readAsDataURL(blob);
    });
  }

}
