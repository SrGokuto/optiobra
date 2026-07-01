import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.scss'
})
export class Proyectos {

  menuAbierto = true;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  crearProyecto() {
    alert('Proyecto creado correctamente');
  }

  editarProyecto(proyecto: any) {
    alert('Editando proyecto: ' + proyecto.nombre);
  }

  eliminarProyecto(proyecto: any) {

    const confirmar = confirm(
      '¿Desea eliminar el proyecto ' + proyecto.nombre + '?'
    );

    if (confirmar) {

      this.proyectos = this.proyectos.filter(
        p => p.id !== proyecto.id
      );

      alert('Proyecto eliminado correctamente');

    }

  }

  proyectos = [

    {
      id:1,
      nombre:'Edificio A',
      responsable:'Carlos Pérez',
      estado:'En proceso',
      avance:'75%'
    },

    {
      id:2,
      nombre:'Casa Residencial',
      responsable:'Laura Gómez',
      estado:'En proceso',
      avance:'60%'
    },

    {
      id:3,
      nombre:'Puente San Martín',
      responsable:'Juan Díaz',
      estado:'Pendiente',
      avance:'30%'
    },

    {
      id:4,
      nombre:'Centro Comercial',
      responsable:'Ana Torres',
      estado:'Finalizado',
      avance:'100%'
    }

  ];

}