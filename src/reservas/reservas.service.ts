import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Reserva } from './entities/reserva.entity';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { BloqueHorario } from '../bloques-horarios/entities/bloques-horario.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtUsuario } from 'src/autenticacion/jwt.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Not } from 'typeorm';
import { PaginacionDto } from '../common/dto/paginacion.dto';
import { ModalidadAtencion } from '../common/enums/modalidad-atencion.enum';
import { CrearReservaTelemedicinaDto } from '../telemedicina/dto/crear-reserva-telemedicina.dto';

@Injectable()
export class ReservasService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Reserva)
    private readonly reservasRepo: Repository<Reserva>,
    @InjectRepository(Paciente)
    private readonly pacientesRepo: Repository<Paciente>,
    @InjectRepository(BloqueHorario)
    private readonly bloquesRepo: Repository<BloqueHorario>,
    @InjectRepository(Medico) private readonly medicosRepo: Repository<Medico>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async crear(dto: CrearReservaDto, usuario: JwtUsuario) {
    return this.crearConModalidad(dto, usuario, ModalidadAtencion.PRESENCIAL);
  }

  async crearTelemedicina(
    dto: CrearReservaTelemedicinaDto,
    usuario: JwtUsuario,
  ) {
    return this.crearConModalidad(
      dto,
      usuario,
      ModalidadAtencion.TELEMEDICINA,
    );
  }

  private async crearConModalidad(
    dto: CrearReservaDto | CrearReservaTelemedicinaDto,
    usuario: JwtUsuario,
    modalidad: ModalidadAtencion,
  ) {
    const paciente = await this.pacientesRepo.findOne({
      where: { usuario: { id: usuario.id } },
      relations: { usuario: true },
    });
    if (!paciente) throw new NotFoundException('Paciente no existe');

    const bloque = await this.bloquesRepo.findOne({
      where: { id: dto.bloqueHorarioId },
      relations: { medico: true },
    });
    if (!bloque) throw new NotFoundException('Bloque horario no existe');

    if (bloque.estado !== 'DISPONIBLE') {
      throw new BadRequestException('El bloque no está disponible');
    }

    if (bloque.modalidad !== modalidad) {
      throw new BadRequestException(
        `El bloque no corresponde a la modalidad ${modalidad}`,
      );
    }

    const medico = await this.medicosRepo.findOne({
      where: { id: bloque.medico.id },
    });
    if (!medico) throw new NotFoundException('Médico no existe');

    const reservaGuardada = await this.dataSource.transaction(
      async (manager) => {
        bloque.estado = 'RESERVADO';
        await manager.save(BloqueHorario, bloque);

        const reserva = manager.create(Reserva, {
          paciente,
          medico,
          bloqueHorario: bloque,
          estado: 'PENDIENTE',
          motivo: dto.motivo,
          modalidad,
          linkTelemedicina:
            'linkTelemedicina' in dto ? dto.linkTelemedicina ?? null : null,
          observaciones:
            'observaciones' in dto ? dto.observaciones ?? null : null,
        });

        return manager.save(Reserva, reserva);
      },
    );

    this.eventEmitter.emit('reserva.creada', {
      reservaId: reservaGuardada.id,
      bloqueId: bloque.id,
      usuarioId: usuario.id,
      rol: usuario.rol,
    });

    return reservaGuardada;
  }

  async listar(paginacionDto: PaginacionDto) {
    const pagina = paginacionDto.pagina ?? 1;
    const limite = paginacionDto.limite ?? 10;

    const [datos, total] = await this.reservasRepo.findAndCount({
      relations: {
        paciente: { usuario: true },
        medico: { especialidades: true },
        bloqueHorario: { medico: { especialidades: true } },
      },
      order: { id: 'DESC' },
      skip: (pagina - 1) * limite,
      take: limite,
    });

    return {
      datos,
      meta: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  async cancelar(id: number, usuario: JwtUsuario) {
    const reserva = await this.reservasRepo.findOne({
      where: { id },
      relations: { bloqueHorario: true },
    });

    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    if (reserva.estado === 'CANCELADA') return reserva;

    const reservaCancelada = await this.dataSource.transaction(
      async (manager) => {
        reserva.estado = 'CANCELADA';
        await manager.save(Reserva, reserva);

        const bloque = await manager.findOne(BloqueHorario, {
          where: { id: reserva.bloqueHorario.id },
        });

        if (bloque) {
          bloque.estado = 'DISPONIBLE';
          await manager.save(BloqueHorario, bloque);
        }

        return reserva;
      },
    );

    // 🔔 Emitimos evento FUERA de la transacción
    this.eventEmitter.emit('reserva.cancelada', {
      reservaId: reservaCancelada.id,
      usuarioId: usuario?.id,
      rol: usuario?.rol,
    });

    return reservaCancelada;
  }

  async listarMis(usuario: { id: number }) {
    const paciente = await this.pacientesRepo.findOne({
      where: { usuario: { id: usuario.id } },
      relations: { usuario: true },
    });
    if (!paciente) throw new NotFoundException('Paciente no existe');

    return this.reservasRepo.find({
      where: {
        paciente: { id: paciente.id },
        estado: Not('CANCELADA'),
      },
      relations: { paciente: true, medico: true, bloqueHorario: true },
      order: { id: 'DESC' },
    });
  }
}
