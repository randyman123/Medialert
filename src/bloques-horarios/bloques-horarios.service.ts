import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloqueHorario } from './entities/bloques-horario.entity';
import { CreateBloquesHorarioDto } from './dto/create-bloques-horario.dto';
import { Medico } from '../medicos/entities/medico.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { ConflictException } from '@nestjs/common';
import { ModalidadAtencion } from '../common/enums/modalidad-atencion.enum';

type FiltrosBloque = {
  estado?: string;
  medicoId?: number;
  desde?: string; // ISO
  hasta?: string; // ISO
  modalidad?: ModalidadAtencion;
};

@Injectable()
export class BloquesHorariosService {
  constructor(
    @InjectRepository(BloqueHorario)
    private readonly repo: Repository<BloqueHorario>,
    @InjectRepository(Medico)
    private readonly medicosRepo: Repository<Medico>,
    @InjectRepository(Reserva)
    private readonly reservasRepo: Repository<Reserva>,
  ) {}

  async create(dto: CreateBloquesHorarioDto) {
    const medico = await this.medicosRepo.findOne({
      where: { id: dto.medicoId },
    });
    if (!medico) throw new NotFoundException('Médico no existe');

    const inicio = new Date(dto.inicio);
    const fin = new Date(dto.fin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new BadRequestException('inicio/fin deben ser fechas ISO válidas');
    }
    if (fin <= inicio) {
      throw new BadRequestException('fin debe ser mayor que inicio');
    }

    const bloque = this.repo.create({
      medico,
      inicio,
      fin,
      estado: dto.estado ?? 'DISPONIBLE',
      modalidad: dto.modalidad ?? ModalidadAtencion.PRESENCIAL,
    });

    return this.repo.save(bloque);
  }

  async findAll(filtros: any) {
    const pagina = filtros.pagina ?? 1;
    const limite = filtros.limite ?? 10;

    const query = this.repo
      .createQueryBuilder('bloque')
      .leftJoinAndSelect('bloque.medico', 'medico')
      .orderBy('bloque.inicio', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite);

    if (filtros.estado) {
      query.andWhere('bloque.estado = :estado', { estado: filtros.estado });
    }

    if (filtros.medicoId) {
      query.andWhere('medico.id = :medicoId', { medicoId: filtros.medicoId });
    }

    if (filtros.modalidad) {
      query.andWhere('bloque.modalidad = :modalidad', {
        modalidad: filtros.modalidad,
      });
    }

    if (filtros.desde) {
      query.andWhere('bloque.inicio >= :desde', { desde: filtros.desde });
    }

    if (filtros.hasta) {
      query.andWhere('bloque.fin <= :hasta', { hasta: filtros.hasta });
    }

    const [datos, total] = await query.getManyAndCount();

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

  async remove(id: number) {
    const bloque = await this.repo.findOne({ where: { id } });
    if (!bloque) throw new NotFoundException('Bloque no encontrado');

    const tieneReserva = await this.reservasRepo.exist({
      where: { bloqueHorario: { id } },
    });

    if (tieneReserva) {
      throw new ConflictException(
        'No puedes eliminar este bloque porque ya tiene una reserva asociada',
      );
    }

    await this.repo.remove(bloque);
    return { message: 'Bloque eliminado' };
  }
}
