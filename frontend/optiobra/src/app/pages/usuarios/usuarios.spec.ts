import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Usuarios } from './usuarios';
import { UsuarioService } from '../../../Services/usuario.service';
import { Usuario } from '../../../Models/usuario-sistema';

describe('Usuarios', () => {
  let component: Usuarios;
  let fixture: ComponentFixture<Usuarios>;
  let service: UsuarioService;

  const usuarioPrueba: Usuario = {
    id: 3,
    username: 'mariana',
    email: 'mariana@optiobra.com',
    first_name: 'Mariana',
    last_name: 'Valderrama',
    nombre_completo: 'Mariana Valderrama',
    rol: 'supervisor',
    activo: true,
    supabase_uid: null,
    perfil: {
      id: 3,
      telefono: '3115557890',
      departamento: 'Bogotá',
      cargo: 'Supervisora',
      avatar_url: '',
      direccion: 'Cra 10 #20-30',
    },
    is_staff: false,
    is_superuser: false,
    date_joined: '2026-01-01',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Usuarios],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Usuarios);
    component = fixture.componentInstance;
    service = TestBed.inject(UsuarioService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('abre el modal de edición con los datos del usuario', () => {
    component.abrirModalEditar(usuarioPrueba);

    expect(component.modalAbierto).toBeTrue();
    expect(component.editando).toBeTrue();
    expect(component.usuarioId).toBe(3);
    expect(component.formulario.nombre_completo).toBe('Mariana Valderrama');
    expect(component.formulario.username).toBe('mariana');
    expect(component.formulario.email).toBe('mariana@optiobra.com');
    expect(component.formulario.rol).toBe('supervisor');
    expect(component.formulario.telefono).toBe('3115557890');
    expect(component.formulario.departamento).toBe('Bogotá');
    expect(component.formulario.cargo).toBe('Supervisora');
    expect(component.formulario.direccion).toBe('Cra 10 #20-30');

    fixture.detectChanges();
    const titulo = fixture.nativeElement.querySelector('.modal-header h3')?.textContent?.trim();
    expect(titulo).toBe('Editar usuario');
  });

  it('abre el modal en blanco al crear un usuario nuevo', () => {
    component.abrirModalNuevo();

    expect(component.modalAbierto).toBeTrue();
    expect(component.editando).toBeFalse();
    expect(component.formulario.nombre_completo).toBe('');
    expect(component.formulario.password).toBe('');

    fixture.detectChanges();
    const titulo = fixture.nativeElement.querySelector('.modal-header h3')?.textContent?.trim();
    expect(titulo).toBe('Nuevo usuario');
  });

  it('cierra el modal', () => {
    component.abrirModalEditar(usuarioPrueba);
    component.cerrarModal();
    expect(component.modalAbierto).toBeFalse();
  });

  it('valida que el nombre completo sea obligatorio al guardar', () => {
    component.abrirModalNuevo();
    component.guardarUsuario();
    expect(component.errorModal).toContain('nombre completo');
    expect(component.modalAbierto).toBeTrue();
  });

  it('guarda los cambios llamando a editarUsuario con el payload correcto', () => {
    const editado: Usuario = { ...usuarioPrueba, nombre_completo: 'Mariana Modificada', perfil: { ...usuarioPrueba.perfil, telefono: '9998887777' } };
    const editarSpy = spyOn(service, 'editarUsuario').and.returnValue(of(editado));
    const reloadSpy = spyOn(service, 'getUsuarios').and.returnValue(
      of({ count: 1, next: null, previous: null, results: [editado] })
    );

    component.abrirModalEditar(usuarioPrueba);
    component.formulario.nombre_completo = 'Mariana Modificada';
    component.formulario.telefono = '9998887777';
    component.guardarUsuario();

    expect(editarSpy).toHaveBeenCalledWith(3, jasmine.objectContaining({
      nombre_completo: 'Mariana Modificada',
      telefono: '9998887777',
      username: 'mariana',
      email: 'mariana@optiobra.com',
      rol: 'supervisor',
    }));
    expect(reloadSpy).toHaveBeenCalled();
    expect(component.modalAbierto).toBeFalse();
    expect(component.usuarios[0].nombre_completo).toBe('Mariana Modificada');
  });

  it('no cierra el modal ni recarga la lista si editarUsuario falla', () => {
    spyOn(service, 'editarUsuario').and.returnValue(throwError(() => new Error('error')));
    const reloadSpy = spyOn(service, 'getUsuarios');

    component.abrirModalEditar(usuarioPrueba);
    component.guardarUsuario();

    expect(component.modalAbierto).toBeTrue();
    expect(reloadSpy).not.toHaveBeenCalled();
    expect(component.errorModal).toBeTruthy();
  });
});
