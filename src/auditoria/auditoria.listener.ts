import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditoriaService } from './auditoria.service';
import { RolUsuario } from 'src/usuarios/rol-usuario.enum';

type EventoReserva = {
  reservaId: number;
  bloqueId?: number;
  usuarioId?: number;
  rol?: RolUsuario; // 👈 ya tipado correctamente
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
}
