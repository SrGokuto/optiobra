import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Categoria,
  ESTADOS_MATERIAL,
  Material,
  MaterialPayload,
  UNIDADES,
} from '../../../Models/material';
import { UsuarioAuth } from '../../../Models/usuario';
import { AuthService } from '../../../Services/auth.service';
import { CategoriaService, MaterialService } from '../../../Services/servicios';

@Component({
  selector: 'app-materiales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materiales.html',
  styleUrl: './materiales.scss',
})
export class Materiales implements OnInit {
  menuAbierto = true;
  materiales: Material[] = [];
  categorias: Categoria[] = [];
  usuario: UsuarioAuth | null = null;

  cargando = false;
  guardando = false;
  error = '';
  mensaje = '';

  filtroBusqueda = '';
  filtroCategoria = '';
  paginaActual = 1;
  totalRegistros = 0;
  haySiguiente = false;
  hayAnterior = false;

  mostrarFormulario = false;
  materialEnEdicion: Material | null = null;

  formulario: MaterialPayload = this.crearFormularioVacio();

  readonly estados = ESTADOS_MATERIAL;
  readonly unidades = UNIDADES;

  constructor(
    private materialService: MaterialService,
    private categoriaService: CategoriaService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((usuario) => {
      this.usuario = usuario;
    });

    if (!this.usuario) {
      this.authService.cargarUsuarioActual();
    }

    this.cargarCategorias();
    this.cargarMateriales();
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: () => {
        this.error = 'No se pudieron cargar las categorías';
      },
    });
  }

  cargarMateriales(): void {
    this.cargando = true;
    this.error = '';

    const filtros = {
      search: this.filtroBusqueda.trim() || undefined,
      categoria: this.filtroCategoria ? Number(this.filtroCategoria) : undefined,
      page: this.paginaActual,
    };

    this.materialService.getMateriales(filtros).subscribe({
      next: (response) => {
        this.materiales = response.results;
        this.totalRegistros = response.count;
        this.haySiguiente = !!response.next;
        this.hayAnterior = !!response.previous;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los materiales';
        this.cargando = false;
      },
    });
  }

  buscar(): void {
    this.paginaActual = 1;
    this.cargarMateriales();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroCategoria = '';
    this.paginaActual = 1;
    this.cargarMateriales();
  }

  paginaAnterior(): void {
    if (!this.hayAnterior) {
      return;
    }
    this.paginaActual -= 1;
    this.cargarMateriales();
  }

  paginaSiguiente(): void {
    if (!this.haySiguiente) {
      return;
    }
    this.paginaActual += 1;
    this.cargarMateriales();
  }

  abrirFormularioNuevo(): void {
    this.materialEnEdicion = null;
    this.formulario = this.crearFormularioVacio();
    this.mostrarFormulario = true;
    this.mensaje = '';
    this.error = '';
  }

  abrirFormularioEdicion(material: Material): void {
    this.materialEnEdicion = material;
    this.formulario = {
      nombre: material.nombre,
      codigo: material.codigo,
      categoria: material.categoria,
      precio: material.precio,
      cantidad: material.cantidad,
      unidad_medida: material.unidad_medida,
      estado: material.estado,
      descripcion: material.descripcion,
      proveedor: material.proveedor,
    };
    this.mostrarFormulario = true;
    this.mensaje = '';
    this.error = '';
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.materialEnEdicion = null;
    this.formulario = this.crearFormularioVacio();
  }

  guardarMaterial(): void {
    if (!this.formulario.nombre || !this.formulario.codigo || !this.formulario.categoria) {
      this.error = 'Completa nombre, código y categoría';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.mensaje = '';

    const request = this.materialEnEdicion
      ? this.materialService.editarMaterial(this.materialEnEdicion.id, this.formulario)
      : this.materialService.crearMaterial(this.formulario);

    request.subscribe({
      next: () => {
        this.guardando = false;
        this.mensaje = this.materialEnEdicion
          ? 'Material actualizado correctamente'
          : 'Material creado correctamente';
        this.cerrarFormulario();
        this.cargarMateriales();
      },
      error: (err) => {
        this.guardando = false;
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  eliminarMaterial(material: Material): void {
    const confirmar = confirm(`¿Eliminar "${material.nombre}"?`);
    if (!confirmar) {
      return;
    }

    this.materialService.eliminarMaterial(material.id).subscribe({
      next: () => {
        this.mensaje = 'Material eliminado correctamente';
        this.cargarMateriales();
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
    });
  }

  nombreUsuario(): string {
    return this.usuario?.nombre_completo || this.usuario?.username || 'Usuario';
  }

  emailUsuario(): string {
    return this.usuario?.email || '';
  }

  formatearPrecio(precio: string): string {
    const valor = Number(precio);
    if (Number.isNaN(valor)) {
      return precio;
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  }

  private crearFormularioVacio(): MaterialPayload {
    return {
      nombre: '',
      codigo: '',
      categoria: 0,
      precio: '0',
      cantidad: 0,
      unidad_medida: 'unidad',
      estado: 'disponible',
      descripcion: '',
      proveedor: '',
    };
  }
}
