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

  materiales: MaterialIA[] = [];
  materialesSugeridos: MaterialIA[] = [];
  agregandoSugeridos = false;
  estimando = false;
  mensajeInfo = '';

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
            this.materiales = [...(refrescada.materiales || [])];
            this.materialesSugeridos = [...(refrescada.materiales_sugeridos || [])];
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
    this.mensajeInfo = '';
    this.materiales = [...(conv.materiales || [])];
    this.materialesSugeridos = [...(conv.materiales_sugeridos || [])];
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
          this.materialesSugeridos = [];
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
    this.mensajeInfo = '';

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
          if (res.materiales_sugeridos && res.materiales_sugeridos.length) {
            this.materialesSugeridos = res.materiales_sugeridos;
            this.mensajeInfo =
              'El asistente sugirió materiales. Pulsa "Añadir materiales sugeridos" para incluirlos.';
          }
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

  anadirMaterialesSugeridos(): void {
    if (!this.conversacionActiva || this.agregandoSugeridos) {
      return;
    }
    this.agregandoSugeridos = true;
    this.error = '';
    this.mensajeInfo = '';
    this.asistenteService.anadirMaterialesSugeridos(this.conversacionActiva.id).subscribe({
      next: (conv) => {
        this.agregandoSugeridos = false;
        this.conversacionActiva = conv;
        this.materiales = [...(conv.materiales || [])];
        this.materialesSugeridos = [];
        this.mensajeInfo = 'Materiales sugeridos añadidos a la lista de estimación.';
        this.cargarConversaciones();
      },
      error: (err) => {
        this.agregandoSugeridos = false;
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  quitarMaterial(index: number): void {
    this.materiales.splice(index, 1);
    if (this.conversacionActiva) {
      this.asistenteService
        .guardarMateriales(this.conversacionActiva.id, '', this.materiales)
        .subscribe({
          next: (conv) => {
            this.conversacionActiva = conv;
            this.cargarConversaciones();
          },
          error: () => {
            this.error = 'No se pudo actualizar la lista de materiales';
          },
        });
    }
  }

  estimar(): void {
    if (!this.conversacionActiva || this.estimando) {
      return;
    }
    this.estimando = true;
    this.error = '';
    this.mensajeInfo = '';
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

  imprimirChat(): void {
    if (!this.conversacionActiva) return;
    const ventana = window.open('', '_blank', 'width=900,height=700');
    if (!ventana) return;
    ventana.onload = () => {
      ventana.focus();
      ventana.print();
    };
    const mensajes = this.mensajes
      .map((mensaje) => `<article class="mensaje"><strong>${mensaje.rol === 'usuario' ? 'Usuario' : 'Asistente IA'}</strong><div>${this.render(mensaje.contenido)}</div><small>${new Date(mensaje.creado_en).toLocaleString('es-CO')}</small></article>`)
      .join('');
    ventana.document.write(`<!doctype html><html><head><title>Chat IA - OptiObra</title><style>
      body{font-family:Arial,sans-serif;color:#1f2937;margin:40px;line-height:1.5}
      header{border-bottom:3px solid #f29f05;padding-bottom:18px;margin-bottom:24px;display:flex;align-items:center;gap:18px}
      header img{width:90px;height:auto}h1{color:#0d1b2a;margin:0;font-size:24px}.meta,small{color:#6b7280;font-size:13px}
      .mensaje{border:1px solid #d1d5db;border-radius:8px;padding:14px;margin:12px 0}.mensaje strong{color:#0d1b2a;display:block;margin-bottom:6px}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #d1d5db;padding:8px;text-align:left}th{background:#fef3c7}
      @media print{body{margin:18mm}}
    </style></head><body><header><img src="${window.location.origin}/assets/Logo.png" alt="OptiObra"><div><h1>OPTIOBRA - CHAT IA</h1><div class="meta">${this.conversacionActiva.titulo || 'Conversación'} | Generado: ${new Date().toLocaleString('es-CO')}</div></div></header>${mensajes}</body></html>`);
    ventana.document.close();
  }
}