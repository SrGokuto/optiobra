import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    const bloques: string[] = [];
    let listaEnCurso = false;

    const cerrarLista = () => {
      if (listaEnCurso) {
        bloques.push('</ul>');
        listaEnCurso = false;
      }
    };

    for (const linea of markdown.split('\n')) {
      const texto = this.aplicarFormato(this.escaparHTML(linea));

      const h1 = texto.match(/^#\s+(.*)/);
      const h2 = texto.match(/^##\s+(.*)/);
      const h3 = texto.match(/^###\s+(.*)/);

      if (h3) {
        cerrarLista();
        bloques.push(`<h3>${h3[1]}</h3>`);
      } else if (h2) {
        cerrarLista();
        bloques.push(`<h2>${h2[1]}</h2>`);
      } else if (h1) {
        cerrarLista();
        bloques.push(`<h1>${h1[1]}</h1>`);
      } else if (/^\s*[-*]\s+/.test(texto)) {
        if (!listaEnCurso) {
          bloques.push('<ul>');
          listaEnCurso = true;
        }
        bloques.push(`<li>${texto.replace(/^\s*[-*]\s+/, '')}</li>`);
      } else if (texto.trim() === '') {
        cerrarLista();
      } else {
        cerrarLista();
        bloques.push(`<p>${texto.trim()}</p>`);
      }
    }
    cerrarLista();
    return bloques.join('\n');
  }

  private aplicarFormato(texto: string): string {
    let resultado = texto;
    resultado = resultado.replace(/`([^`]+)`/g, '<code>$1</code>');
    resultado = resultado.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    resultado = resultado.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    resultado = resultado.replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    resultado = resultado.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );
    return resultado;
  }

  private escaparHTML(texto: string): string {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }
}