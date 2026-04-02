import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditoriaService } from './auditoria.service';
import { RolUsuario } from 'src/usuarios/rol-usuario.enum';
import { CategoriaArchivo } from 'src/mis-archivos/categoria-archivo.enum';

type EventoReserva = {
  reservaId: number;
  bloqueId?: number;
  usuarioId?: number;
  rol?: RolUsuario; // 👈 ya tipado correctamente
};

type EventoArchivo = {
  archivoId: number;
  pacienteId: number;
  usuarioId?: number;
  rol?: RolUsuario;
  categoria?: CategoriaArchivo;
  nombreOriginal?: string;
};

@Injectable()
export class AuditoriaListener {
  constructor(private readonly auditoria: AuditoriaService) {}

  @OnEvent('reserva.creada')
  async onReservaCreada(payload: EventoReserva) {
    await this.auditoria.registrar({
      accion: 'RESERVA_CREADA',
      entidad: 'Reserva',
      entidadId: payload.reservaId,
      usuarioId: payload.usuarioId ?? null,
      rol: payload.rol ?? null,
    });
  }

  @OnEvent('reserva.cancelada')
  async onReservaCancelada(payload: EventoReserva) {
    await this.auditoria.registrar({
      accion: 'RESERVA_CANCELADA',
      entidad: 'Reserva',
      entidadId: payload.reservaId,
      usuarioId: payload.usuarioId ?? null,
      rol: payload.rol ?? null,
      detalle: null,
    });
  }

  @OnEvent('archivo.subido')
  async onArchivoSubido(payload: EventoArchivo) {
    await this.auditoria.registrar({
      accion: 'ARCHIVO_SUBIDO',
      entidad: 'MisArchivo',
      entidadId: payload.archivoId,
      usuarioId: payload.usuarioId ?? null,
      rol: payload.rol ?? null,
      detalle: {
        pacienteId: payload.pacienteId,
        categoria: payload.categoria ?? null,
        nombreOriginal: payload.nombreOriginal ?? null,
      },
    });
  }

  @OnEvent('archivo.eliminado')
  async onArchivoEliminado(payload: EventoArchivo) {
    await this.auditoria.registrar({
      accion: 'ARCHIVO_ELIMINADO',
      entidad: 'MisArchivo',
      entidadId: payload.archivoId,
      usuarioId: payload.usuarioId ?? null,
      rol: payload.rol ?? null,
      detalle: {
        pacienteId: payload.pacienteId,
        categoria: payload.categoria ?? null,
        nombreOriginal: payload.nombreOriginal ?? null,
      },
    });
  }
}
