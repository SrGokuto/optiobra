import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { UsuarioService } from '../../../Services/usuario.service';
import { Usuario } from '../../../Models/usuario-sistema';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios implements OnInit {

  menuAbierto = true;
  usuarios: Usuario[] = [];
  cargando = false;
  error = '';

  filtroBusqueda = '';
  filtroRol = '';

  roles = [
    'Todos los roles',
    'admin',
    'supervisor',
    'ingeniero',
    'usuario'
  ];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = '';

    const filtros: { search?: string; rol?: string } = {};

    if (this.filtroBusqueda) {
      filtros.search = this.filtroBusqueda;
    }
    if (this.filtroRol && this.filtroRol !== 'Todos los roles') {
      filtros.rol = this.filtroRol;
    }

    this.usuarioService.getUsuarios(filtros).subscribe({
      next: (respuesta) => {
        this.usuarios = respuesta.results;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios';
        this.cargando = false;
      }
    });
  }

  onFiltroChange(): void {
    this.cargarUsuarios();
  }

  crearUsuario(): void {
    alert('Funcionalidad de crear usuario pendiente de implementación con formulario modal');
  }

  editarUsuario(usuario: Usuario): void {
    alert('Editando usuario: ' + usuario.nombre_completo);
  }

  eliminarUsuario(usuario: Usuario): void {
    const confirmar = confirm(
      '¿Desea eliminar el usuario ' + usuario.nombre_completo + '?'
    );

    if (confirmar) {
      this.usuarioService.eliminarUsuario(usuario.id).subscribe({
        next: () => {
          this.cargarUsuarios();
        },
        error: () => {
          alert('Error al eliminar el usuario');
        }
      });
    }
  }

  formatearRol(rol: string): string {
    const mapaRoles: Record<string, string> = {
      'admin': 'Administrador',
      'supervisor': 'Supervisor',
      'ingeniero': 'Ingeniero',
      'usuario': 'Operario'
    };
    return mapaRoles[rol] || rol;
  }

  formatearEstado(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }
}
