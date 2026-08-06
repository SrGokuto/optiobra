import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, FormsModule, RouterLink],
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
      error: (err) => {
        console.error('Error al cargar categorías', err);
      },
    });
  }

  cargarMateriales(): void {
    this.cargando = true;
    this.error = '';

    const filtros: any = {};
    if (this.filtroBusqueda) {
      filtros.search = this.filtroBusqueda;
    }
    if (this.filtroCategoria) {
      filtros.categoria = this.filtroCategoria;
    }
    filtros.page = this.paginaActual;

    this.materialService.getMateriales(filtros).subscribe({
      next: (respuesta) => {
        this.materiales = respuesta.results;
        this.totalRegistros = respuesta.count;
        this.haySiguiente = !!respuesta.next;
        this.hayAnterior = !!respuesta.previous;
        this.cargando = false;
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
        this.cargando = false;
      },
    });
  }

  abrirFormularioCrear(): void {
    this.materialEnEdicion = null;
    this.formulario = this.crearFormularioVacio();
    this.mostrarFormulario = true;
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
      descripcion: material.descripcion || '',
      proveedor: material.proveedor || '',
    };
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.materialEnEdicion = null;
    this.formulario = this.crearFormularioVacio();
  }

  guardarMaterial(): void {
    this.guardando = true;
    this.error = '';

    if (this.materialEnEdicion) {
      this.materialService.editarMaterial(this.materialEnEdicion.id, this.formulario).subscribe({
        next: () => {
          this.mensaje = 'Material actualizado correctamente';
          this.guardando = false;
          this.cerrarFormulario();
          this.cargarMateriales();
        },
        error: (err) => {
          this.error = AuthService.extraerMensajeError(err);
          this.guardando = false;
        },
      });
    } else {
      this.materialService.crearMaterial(this.formulario).subscribe({
        next: () => {
          this.mensaje = 'Material creado correctamente';
          this.guardando = false;
          this.cerrarFormulario();
          this.cargarMateriales();
        },
        error: (err) => {
          this.error = AuthService.extraerMensajeError(err);
          this.guardando = false;
        },
      });
    }
  }

  eliminarMaterial(material: Material): void {
    const confirmar = confirm('¿Desea eliminar el material ' + material.nombre + '?');
    if (!confirmar) return;

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

  paginaAnterior(): void {
    if (this.hayAnterior && this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarMateriales();
    }
  }

  paginaSiguiente(): void {
    if (this.haySiguiente) {
      this.paginaActual++;
      this.cargarMateriales();
    }
  }

  buscar(): void {
    this.paginaActual = 1;
    this.cargarMateriales();
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
