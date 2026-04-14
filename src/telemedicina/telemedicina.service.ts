import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtUsuario } from '../autenticacion/jwt.guard';
import { ModalidadAtencion } from '../common/enums/modalidad-atencion.enum';
import { BloqueHorario } from '../bloques-horarios/entities/bloques-horario.entity';
import { EspecialidadesService } from '../especialidades/especialidades.service';
import { MedicosService } from '../medicos/medicos.service';
import { ReservasService } from '../reservas/reservas.service';
import { CrearReservaTelemedicinaDto } from './dto/crear-reserva-telemedicina.dto';
import { GenerarSalaTelemedicinaDto } from './dto/generar-sala-telemedicina.dto';
import { TelemedicinaVideoService } from './video/telemedicina-video.service';

@Injectable()
export class TelemedicinaService {
  constructor(
    @InjectRepository(BloqueHorario)
    private readonly bloquesRepo: Repository<BloqueHorario>,
    private readonly especialidadesService: EspecialidadesService,
    private readonly medicosService: MedicosService,
    private readonly reservasService: ReservasService,
    private readonly telemedicinaVideoService: TelemedicinaVideoService,
  ) {}

  listarEspecialidades() {
    return this.especialidadesService.findAllDisponiblesPorModalidad(
      ModalidadAtencion.TELEMEDICINA,
    );
  }

  async listarMedicos(especialidadId: number) {
    await this.especialidadesService.findOne(especialidadId);

    const medicos =
      await this.medicosService.listarDisponiblesPorEspecialidadYModalidad(
        especialidadId,
        ModalidadAtencion.TELEMEDICINA,
      );

    return {
      especialidadId,
      modalidad: ModalidadAtencion.TELEMEDICINA,
      medicos,
    };
  }

  listarHorarios(medicoId: number, fecha: string) {
    if (!fecha) {
      throw new BadRequestException('Debe indicar la fecha');
    }

    return this.medicosService.obtenerDisponibilidad(
      medicoId,
      fecha,
      ModalidadAtencion.TELEMEDICINA,
    );
  }

  async reservar(dto: CrearReservaTelemedicinaDto, usuario: JwtUsuario) {
    let linkTelemedicina = dto.linkTelemedicina ?? null;
    const shouldCreateRoom =
      !linkTelemedicina &&
      (dto.generarSalaAutomaticamente ??
        this.telemedicinaVideoService.shouldAutoCreateRoom());

    if (shouldCreateRoom) {
      const bloque = await this.obtenerBloqueTelemedicina(dto.bloqueHorarioId);
      const room = await this.telemedicinaVideoService.createRoom({
        bloqueHorarioId: bloque.id,
        medicoId: bloque.medico.id,
        modalidad: 'TELEMEDICINA',
        scheduledStartAt: bloque.inicio.toISOString(),
        scheduledEndAt: bloque.fin.toISOString(),
        doctorName: bloque.medico.nombreCompleto,
      });
      linkTelemedicina = room.roomUrl;
    }

    return this.reservasService.crearTelemedicina(
      {
        ...dto,
        linkTelemedicina: linkTelemedicina ?? undefined,
      },
      usuario,
    );
  }

  async generarSalaPreview(
    dto: GenerarSalaTelemedicinaDto,
    _usuario: JwtUsuario,
  ) {
    const bloque = await this.obtenerBloqueTelemedicina(dto.bloqueHorarioId);

    const room = await this.telemedicinaVideoService.createRoom({
      bloqueHorarioId: bloque.id,
      medicoId: bloque.medico.id,
      modalidad: 'TELEMEDICINA',
      scheduledStartAt: bloque.inicio.toISOString(),
      scheduledEndAt: bloque.fin.toISOString(),
      doctorName: bloque.medico.nombreCompleto,
    });

    return {
      provider: room.provider,
      roomName: room.roomName,
      roomUrl: room.roomUrl,
      mocked: room.mocked,
      bloqueHorarioId: bloque.id,
      medicoId: bloque.medico.id,
    };
  }

  private async obtenerBloqueTelemedicina(bloqueHorarioId: number) {
    const bloque = await this.bloquesRepo.findOne({
      where: { id: bloqueHorarioId },
      relations: { medico: true },
    });

    if (!bloque) {
      throw new NotFoundException('Bloque horario no existe');
    }

    if (bloque.modalidad !== ModalidadAtencion.TELEMEDICINA) {
      throw new BadRequestException(
        'El bloque no corresponde a telemedicina',
      );
    }

    return bloque;
  }
}
