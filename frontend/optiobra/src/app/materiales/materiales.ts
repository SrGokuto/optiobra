// materiales.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Material,
  FiltroMaterial,
  CATEGORIAS,
  UNIDADES,
  PROYECTOS,
} from '../../models/material.model';
import { MaterialService } from '../../services/material.service';

@Component({
  selector: 'app-materiales',
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.scss'],
})
export class MaterialesComponent implements OnInit {

  // ── Datos de la tabla ─────────────────────────────────────
  materiales: Material[] = [];
  totalRegistros = 0;
  paginaActual  = 1;
  totalPaginas  = 1;
  limite        = 5;
  paginas: number[] = [];

  // ── Filtros ───────────────────────────────────────────────
  filtros: FiltroMaterial = {
    busqueda: '',
    proyecto: 'Todos los proyectos',
    pagina:   1,
    limite:   5,
  };

  // ── Listas para selects ───────────────────────────────────
  categorias     = CATEGORIAS;
  unidades       = UNIDADES;
  proyectos      = PROYECTOS;
  proyectosFiltro = PROYECTOS.filter(p => p !== 'Todos los proyectos');

  // ── Modal crear/editar ────────────────────────────────────
  mostrarModal       = false;
  materialSeleccionado: Material | null = null;
  materialForm!: FormGroup;

  // ── Modal eliminar ────────────────────────────────────────
  mostrarModalEliminar = false;
  idAEliminar: number | null = null;

  // ── Estado de carga ───────────────────────────────────────
  isLoading = false;

  constructor(
    private materialService: MaterialService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.cargarMateriales();
  }

  // ── Construcción del formulario ───────────────────────────
  private buildForm(): void {
    this.materialForm = this.fb.group({
      nombre:         ['', Validators.required],
      categoria:      ['', Validators.required],
      unidad:         ['', Validators.required],
      cantidad:       ['', [Validators.required, Validators.min(0)]],
      precioUnitario: ['', [Validators.required, Validators.min(0)]],
      proyecto:       ['', Validators.required],
    });
  }

  // ── Cargar materiales ─────────────────────────────────────
  cargarMateriales(): void {
    this.materialService.getMateriales(this.filtros).subscribe({
      next: (res) => {
        this.materiales     = res.materiales;
        this.totalRegistros = res.totalRegistros;
        this.paginaActual   = res.paginaActual;
        this.totalPaginas   = res.totalPaginas;
        this.generarPaginas();
      },
      error: (err) => {
        console.error('Error al cargar materiales:', err);
      },
    });
  }

  // ── Generar array de páginas para la paginación ───────────
  generarPaginas(): void {
    this.paginas = Array.from(
      { length: this.totalPaginas },
      (_, i) => i + 1
    );
  }

  // ── Info de paginación ────────────────────────────────────
  get desde(): number {
    return (this.paginaActual - 1) * this.limite + 1;
  }

  get hasta(): number {
    return Math.min(this.paginaActual * this.limite, this.totalRegistros);
  }

  // ── Cambiar página ────────────────────────────────────────
  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.filtros.pagina = pagina;
    this.cargarMateriales();
  }

  // ── Buscar ────────────────────────────────────────────────
  onBuscar(): void {
    this.filtros.pagina = 1;
    this.cargarMateriales();
  }

  // ── Filtrar por proyecto ──────────────────────────────────
  onFiltrarProyecto(): void {
    this.filtros.pagina = 1;
    this.cargarMateriales();
  }

  // ── Abrir modal para crear ────────────────────────────────
  abrirModal(): void {
    this.materialSeleccionado = null;
    this.materialForm.reset();
    this.mostrarModal = true;
  }

  // ── Abrir modal para editar ───────────────────────────────
  editarMaterial(material: Material): void {
    this.materialSeleccionado = material;
    this.materialForm.patchValue({
      nombre:         material.nombre,
      categoria:      material.categoria,
      unidad:         material.unidad,
      cantidad:       material.cantidad,
      precioUnitario: material.precioUnitario,
      proyecto:       material.proyecto,
    });
    this.mostrarModal = true;
  }

  // ── Cerrar modal ──────────────────────────────────────────
  cerrarModal(): void {
    this.mostrarModal = false;
    this.materialSeleccionado = null;
    this.materialForm.reset();
  }

  // ── Guardar (crear o editar) ──────────────────────────────
  guardarMaterial(): void {
    this.materialForm.markAllAsTouched();
    if (this.materialForm.invalid) return;

    this.isLoading = true;
    const payload = this.materialForm.value;

    if (this.materialSeleccionado) {
      // Editar
      this.materialService
        .editarMaterial(this.materialSeleccionado.id, payload)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.cerrarModal();
            this.cargarMateriales();
          },
          error: (err) => {
            console.error('Error al editar:', err);
            this.isLoading = false;
          },
        });
    } else {
      // Crear
      this.materialService.crearMaterial(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.cerrarModal();
          this.cargarMateriales();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          this.isLoading = false;
        },
      });
    }
  }

  // ── Confirmar eliminar ────────────────────────────────────
  confirmarEliminar(id: number): void {
    this.idAEliminar = id;
    this.mostrarModalEliminar = true;
  }

  // ── Cancelar eliminar ─────────────────────────────────────
  cancelarEliminar(): void {
    this.idAEliminar = null;
    this.mostrarModalEliminar = false;
  }

  // ── Eliminar material ─────────────────────────────────────
  eliminarMaterial(): void {
    if (!this.idAEliminar) return;

    this.materialService.eliminarMaterial(this.idAEliminar).subscribe({
      next: () => {
        this.cancelarEliminar();
        this.cargarMateriales();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
      },
    });
  }

  // ── Validación de campos del formulario ───────────────────
  isInvalid(field: string): boolean {
    const ctrl = this.materialForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}