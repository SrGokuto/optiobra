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

  crearMaterial() {
    alert('Material registrado correctamente');
  }

  editarMaterial(material: any) {
    alert('Editando material: ' + material.nombre);
  }

  eliminarMaterial(material: any) {

    const confirmar = confirm(
      '¿Desea eliminar el material ' + material.nombre + '?'
    );

    if (confirmar) {

      this.materiales =
        this.materiales.filter(
          (m) => m.id !== material.id
        );

      alert('Material eliminado correctamente');
    }
  }

  materiales = [
    {
      id: 1,
      nombre: 'Cemento Portland',
      categoria: 'Cemento',
      unidad: 'Bulto (50kg)',
      cantidad: 120,
      precio: '$33.000',
      proyecto: 'Edificio A'
    },
    {
      id: 2,
      nombre: 'Arena fina',
      categoria: 'Áridos',
      unidad: 'm³',
      cantidad: 15,
      precio: '$130.000',
      proyecto: 'Edificio A'
    },
    {
      id: 3,
      nombre: 'Ladrillo King Kong',
      categoria: 'Ladrillos',
      unidad: 'Unidad',
      cantidad: 1500,
      precio: '$6.500',
      proyecto: 'Casa Residencial'
    },
    {
      id: 4,
      nombre: 'Acero Corrugado 3/8"',
      categoria: 'Acero',
      unidad: 'Varilla (9m)',
      cantidad: 200,
      precio: '$4.500',
      proyecto: 'Edificio A'
    },
    {
      id: 5,
      nombre: 'Pintura Blanca',
      categoria: 'Acabados',
      unidad: 'Galón',
      cantidad: 30,
      precio: '$150.000',
      proyecto: 'Casa Residencial'
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
