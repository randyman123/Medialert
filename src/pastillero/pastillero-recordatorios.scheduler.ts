import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationService,
} from '../notificaciones/notification.service';
import type { MedicationReminderNotification } from '../notificaciones/notification.service';
import { Pastillero } from './entities/pastillero.entity';
import { RecordatorioMedicamento } from './entities/recordatorio-medicamento.entity';
import {
  calcularFechaFinTratamientoCompleta,
  combinarFechaYHora,
} from './pastillero-fechas';

const LOOKBACK_WINDOW_MS = 5 * 60 * 1000;

type EventoRecordatorioPendiente = {
  eventoClave: string;
  tipo: 'EXACTO' | 'ANTICIPADO';
  minutosAntes: number;
  fechaDosisProgramada: Date;
  fechaRecordatorio: Date;
  medicamento: Pastillero;
};

@Injectable()
export class PastilleroRecordatoriosScheduler {
  private readonly logger = new Logger(PastilleroRecordatoriosScheduler.name);

  constructor(
    @InjectRepository(Pastillero)
    private readonly pastilleroRepo: Repository<Pastillero>,
    @InjectRepository(RecordatorioMedicamento)
    private readonly recordatoriosRepo: Repository<RecordatorioMedicamento>,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async revisarRecordatoriosActivos() {
    const ahora = new Date();

    await this.desactivarAlarmasDeTratamientosFinalizados(ahora);

    const medicamentos = await this.pastilleroRepo.find({
      where: {
        activo: true,
        alarmaActiva: true,
        whatsappRecordatorioActivo: true,
      },
      relations: { paciente: true },
    });

    for (const medicamento of medicamentos) {
      const eventos = this.obtenerEventosPendientes(medicamento, ahora);

      for (const evento of eventos) {
        const payload = this.construirNotificationPayload(evento);
        const availability = this.notificationService.canSendMedicationReminder(
          payload,
        );

        if (!availability.allowed) {
          continue;
        }

        const registrado = await this.registrarEventoSiNoExiste(evento);

        if (!registrado) {
          continue;
        }

        const resultado = await this.notificationService.sendMedicationReminder(
          payload,
        );

        if (!resultado.delivered) {
          continue;
        }

        this.logger.log(
          `Recordatorio listo para envio. medicamentoId=${medicamento.id} evento=${evento.eventoClave}`,
        );

        await this.recordatoriosRepo.update(
          { eventoClave: evento.eventoClave },
          {
            canal: resultado.channel,
            proveedor: resultado.provider,
          },
        );

        this.eventEmitter.emit('pastillero.recordatorio-generado', {
          medicamentoId: medicamento.id,
          pacienteId: medicamento.paciente.id,
          usuarioId: medicamento.paciente.usuario.id,
          fechaDosisProgramada: evento.fechaDosisProgramada.toISOString(),
          fechaRecordatorio: evento.fechaRecordatorio.toISOString(),
          tipo: evento.tipo,
          minutosAntes: evento.minutosAntes,
          canal: resultado.channel,
          proveedor: resultado.provider,
        });
      }
    }
  }

  private async desactivarAlarmasDeTratamientosFinalizados(ahora: Date) {
    const medicamentos = await this.pastilleroRepo.find({
      where: {
        activo: true,
        alarmaActiva: true,
        whatsappRecordatorioActivo: true,
      },
    });

    const vencidos = medicamentos.filter(
      (medicamento) => calcularFechaFinTratamientoCompleta(medicamento) < ahora,
    );

    if (vencidos.length === 0) {
      return;
    }

    for (const medicamento of vencidos) {
      medicamento.alarmaActiva = false;
      medicamento.whatsappRecordatorioActivo = false;
    }

    await this.pastilleroRepo.save(vencidos);

    this.logger.log(
      `Alarmas desactivadas por fin de tratamiento: ${vencidos.length}`,
    );
  }

  private obtenerEventosPendientes(medicamento: Pastillero, ahora: Date) {
    const frecuenciaMs = medicamento.frecuenciaHoras * 60 * 60 * 1000;
    const inicio = combinarFechaYHora(medicamento.fechaInicio, medicamento.horaInicio);
    const finTratamiento = calcularFechaFinTratamientoCompleta(medicamento);
    const minutosAntes = medicamento.recordarMinutosAntes ?? 0;
    const anticipacionMs = minutosAntes * 60 * 1000;
    const ventanaInicio = new Date(ahora.getTime() - LOOKBACK_WINDOW_MS);
    const ventanaFin = ahora;

    const indiceMinimo = Math.max(
      0,
      Math.ceil(
        (ventanaInicio.getTime() + anticipacionMs - inicio.getTime()) /
          frecuenciaMs,
      ),
    );
    const indiceMaximo = Math.floor(
      (ventanaFin.getTime() + anticipacionMs - inicio.getTime()) / frecuenciaMs,
    );

    const eventos: EventoRecordatorioPendiente[] = [];

    for (let indice = indiceMinimo; indice <= indiceMaximo; indice += 1) {
      const fechaDosisProgramada = new Date(inicio.getTime() + indice * frecuenciaMs);

      if (fechaDosisProgramada > finTratamiento) {
        break;
      }

      const fechaRecordatorio = new Date(
        fechaDosisProgramada.getTime() - anticipacionMs,
      );

      if (
        fechaRecordatorio < ventanaInicio ||
        fechaRecordatorio > ventanaFin
      ) {
        continue;
      }

      eventos.push({
        eventoClave: this.construirEventoClave(
          medicamento.id,
          fechaDosisProgramada,
          minutosAntes,
        ),
        tipo: minutosAntes > 0 ? 'ANTICIPADO' : 'EXACTO',
        minutosAntes,
        fechaDosisProgramada,
        fechaRecordatorio,
        medicamento,
      });
    }

    return eventos;
  }

  private construirEventoClave(
    medicamentoId: number,
    fechaDosisProgramada: Date,
    minutosAntes: number,
  ) {
    return `${medicamentoId}:${fechaDosisProgramada.toISOString()}:${minutosAntes}`;
  }

  private async registrarEventoSiNoExiste(evento: EventoRecordatorioPendiente) {
    try {
      const recordatorio = this.recordatoriosRepo.create({
        eventoClave: evento.eventoClave,
        tipo: evento.tipo,
        minutosAntes: evento.minutosAntes,
        fechaDosisProgramada: evento.fechaDosisProgramada,
        fechaRecordatorio: evento.fechaRecordatorio,
        canal: 'whatsapp',
        proveedor: 'mock',
        medicamento: evento.medicamento,
      });

      await this.recordatoriosRepo.save(recordatorio);
      return true;
    } catch (error: unknown) {
      if (this.esErrorClaveDuplicada(error)) {
        return false;
      }

      throw error;
    }
  }

  private construirNotificationPayload(
    evento: EventoRecordatorioPendiente,
  ): MedicationReminderNotification {
    return {
      medicamentoId: evento.medicamento.id,
      nombreMedicamento: evento.medicamento.nombreMedicamento,
      dosis: evento.medicamento.dosis ?? null,
      pacienteId: evento.medicamento.paciente.id,
      pacienteNombre: evento.medicamento.paciente.nombreCompleto ?? null,
      pacienteTelefono: evento.medicamento.paciente.telefono ?? null,
      fechaDosisProgramada: evento.fechaDosisProgramada.toISOString(),
      fechaRecordatorio: evento.fechaRecordatorio.toISOString(),
      horaMedicamento: evento.medicamento.horaInicio,
      minutosAntes: evento.minutosAntes,
      tipo: evento.tipo,
    };
  }

  private esErrorClaveDuplicada(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'ER_DUP_ENTRY'
    );
  }
}
