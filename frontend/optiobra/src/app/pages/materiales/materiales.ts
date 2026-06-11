import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-materiales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './materiales.html',
  styleUrl: './materiales.scss'
})
export class Materiales {

  menuAbierto = true;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
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
  ];

}