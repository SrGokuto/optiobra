import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class Landing {
  steps = [
    {
      number: '01',
      title: 'Registra tu proyecto',
      description: 'Crea tu cuenta y configura los datos básicos de tu obra en minutos.'
    },
    {
      number: '02',
      title: 'Organiza tu equipo',
      description: 'Agrega trabajadores, asigna roles y establece permisos de acceso.'
    },
    {
      number: '03',
      title: 'Gestiona todo',
      description: 'Controla tareas, materiales, avances y reportes desde una sola plataforma.'
    }
  ];
}
