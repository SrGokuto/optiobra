import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss']
})
export class ReportesComponent {

  // Filtros
  tipoReporte: string = '';
  proyecto: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  // Opciones de los select
  tiposReporte: string[] = [
    'Proyectos',
    'Materiales',
    'Trabajadores',
    'Avance de obra'
  ];

  proyectos: string[] = [
    'Proyecto A',
    'Proyecto B',
    'Proyecto C'
  ];

  // Datos de las tarjetas
  proyectosActivos: number = 15;
  trabajadores: number = 120;
  presupuesto: string = '$580 M';
  avancePromedio: number = 85;

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