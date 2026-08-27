import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenteIAService } from '../../../../Services/asistente-ia.service';
import { AuthService } from '../../../../Services/auth.service';
import { ConversacionIA, MaterialIA, MensajeIA } from '../../../../Models/asistente-ia';
import { renderizarMarkdown } from '../../../../utils/markdown';

@Component({
  selector: 'app-asistente-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistente-proyectos.html',
  styleUrls: ['./asistente-proyectos.scss'],
})
export class AsistenteProyectosComponent implements OnInit {
  conversaciones: ConversacionIA[] = [];
  conversacionActiva: ConversacionIA | null = null;
  mensajes: MensajeIA[] = [];

  nuevoMensaje = '';
  enviando = false;
  cargando = false;
  error = '';

  descripcionProyecto = '';
  materiales: MaterialIA[] = [];
  nuevoMaterial = { nombre: '', unidad: '' };
  guardandoMateriales = false;
  estimando = false;

  constructor(private asistenteService: AsistenteIAService) {}

  ngOnInit(): void {
    this.cargarConversaciones();
  }

  cargarConversaciones(): void {
    this.cargando = true;
    this.error = '';
    this.asistenteService.listarConversaciones().subscribe({
      next: (data) => {
        this.conversaciones = data;
        this.cargando = false;
        if (this.conversacionActiva) {
          const refrescada = data.find((c) => c.id === this.conversacionActiva?.id);
          if (refrescada) {
            this.conversacionActiva = refrescada;
          }
        }
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudieron cargar las conversaciones';
      },
    });
  }

  nuevaConversacion(): void {
    this.cargando = true;
    this.error = '';
    this.asistenteService.crearConversacion().subscribe({
      next: (conv) => {
        this.cargando = false;
        this.seleccionarConversacion(conv);
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo crear la conversación';
      },
    });
  }

  seleccionarConversacion(conv: ConversacionIA): void {
    this.conversacionActiva = conv;
    this.error = '';
    this.descripcionProyecto = conv.descripcion_proyecto || '';
    this.materiales = [...(conv.materiales || [])];
    this.nuevoMensaje = '';
    this.cargarMensajes(conv.id);
  }

  cargarMensajes(id: number): void {
    this.asistenteService.listarMensajes(id).subscribe({
      next: (msjs) => {
        this.mensajes = msjs;
        setTimeout(() => this.scrollAlFinal(), 0);
      },
      error: () => {
        this.error = 'No se pudieron cargar los mensajes';
      },
    });
  }

  eliminarConversacion(conv: ConversacionIA): void {
    this.error = '';
    this.asistenteService.eliminarConversacion(conv.id).subscribe({
      next: () => {
        this.conversaciones = this.conversaciones.filter((c) => c.id !== conv.id);
        if (this.conversacionActiva?.id === conv.id) {
          this.conversacionActiva = null;
          this.mensajes = [];
          this.materiales = [];
          this.descripcionProyecto = '';
        }
      },
      error: () => {
        this.error = 'No se pudo eliminar la conversación';
      },
    });
  }

  enviarMensaje(): void {
    const contenido = this.nuevoMensaje.trim();
    if (!contenido || !this.conversacionActiva || this.enviando) {
      return;
    }
    this.enviando = true;
    this.error = '';

    const id = this.conversacionActiva.id;
    this.mensajes.push({
      id: -Date.now(),
      rol: 'usuario',
      contenido,
      creado_en: new Date().toISOString(),
    });
    this.nuevoMensaje = '';
    this.scrollAlFinal();

    this.asistenteService.enviarMensaje(id, contenido).subscribe({
      next: (res) => {
        this.enviando = false;
        if (res.success && res.mensaje) {
          this.mensajes.push(res.mensaje);
          this.scrollAlFinal();
          this.cargarConversaciones();
        } else {
          this.error = res.message || 'El asistente no pudo responder';
        }
      },
      error: (err) => {
        this.enviando = false;
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  agregarMaterial(): void {
    const nombre = this.nuevoMaterial.nombre.trim();
    if (!nombre) {
      return;
    }
    this.materiales.push({
      nombre,
      unidad: this.nuevoMaterial.unidad.trim() || 'unidad',
    });
    this.nuevoMaterial = { nombre: '', unidad: '' };
  }

  quitarMaterial(index: number): void {
    this.materiales.splice(index, 1);
  }

  guardarMateriales(): void {
    if (!this.conversacionActiva || this.guardandoMateriales) {
      return;
    }
    this.guardandoMateriales = true;
    this.error = '';
    this.asistenteService
      .guardarMateriales(this.conversacionActiva.id, this.descripcionProyecto, this.materiales)
      .subscribe({
        next: (conv) => {
          this.guardandoMateriales = false;
          this.conversacionActiva = conv;
          this.cargarConversaciones();
        },
        error: () => {
          this.guardandoMateriales = false;
          this.error = 'No se pudieron guardar los materiales';
        },
      });
  }

  estimar(): void {
    if (!this.conversacionActiva || this.estimando) {
      return;
    }
    this.estimando = true;
    this.error = '';
    this.asistenteService.estimarMateriales(this.conversacionActiva.id).subscribe({
      next: (res) => {
        this.estimando = false;
        if (res.success && res.mensaje) {
          this.mensajes.push(res.mensaje);
          this.scrollAlFinal();
          this.cargarConversaciones();
        } else {
          this.error = res.message || 'No se pudo estimar';
        }
      },
      error: (err) => {
        this.estimando = false;
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  render(markdown: string): string {
    return renderizarMarkdown(markdown);
  }

  scrollAlFinal(): void {
    const el = document.querySelector('.chat-mensajes');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}