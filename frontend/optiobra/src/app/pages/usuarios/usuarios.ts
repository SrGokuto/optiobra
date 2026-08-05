import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios {

  menuAbierto = true;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  crearUsuario() {
    alert('Usuario creado correctamente');
  }

  editarUsuario(usuario: any) {
    alert('Editando usuario: ' + usuario.nombre);
  }

  eliminarUsuario(usuario: any) {

    const confirmar = confirm(
      '¿Desea eliminar el usuario ' + usuario.nombre + '?'
    );

    if (confirmar) {

      this.usuarios = this.usuarios.filter(
        u => u.id !== usuario.id
      );

      alert('Usuario eliminado correctamente');

    }

  }

  usuarios = [

    {
      id: 1,
      nombre: 'Carlos Pérez',
      correo: 'carlos@optiobra.com',
      rol: 'Administrador',
      estado: 'Activo'
    },

    {
      id: 2,
      nombre: 'Laura Gómez',
      correo: 'laura@optiobra.com',
      rol: 'Supervisor',
      estado: 'Activo'
    },

    {
      id: 3,
      nombre: 'Juan Díaz',
      correo: 'juan@optiobra.com',
      rol: 'Ingeniero',
      estado: 'Inactivo'
    },

    {
      id: 4,
      nombre: 'Ana Torres',
      correo: 'ana@optiobra.com',
      rol: 'Residente',
      estado: 'Activo'
    },

    {
      id: 5,
      nombre: 'Miguel Rojas',
      correo: 'miguel@optiobra.com',
      rol: 'Operario',
      estado: 'Activo'
    }

  ];

}