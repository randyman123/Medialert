import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Medico } from './entities/medico.entity';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { CentroMedico } from '../centros-medicos/entities/centro-medico.entity';
import { Especialidad } from '../especialidades/entities/especialidad.entity';
import { BloqueHorario } from '../bloques-horarios/entities/bloques-horario.entity';
import { FiltrarMedicosDto } from './dto/filtrar-medicos.dto';
import { ModalidadAtencion } from '../common/enums/modalidad-atencion.enum';

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico)
    private readonly repo: Repository<Medico>,

    @InjectRepository(CentroMedico)
    private readonly centrosRepo: Repository<CentroMedico>,

    @InjectRepository(Especialidad)
    private readonly espRepo: Repository<Especialidad>,

    @InjectRepository(BloqueHorario)
    private readonly bloquesRepo: Repository<BloqueHorario>,
  ) {}

  async create(dto: CreateMedicoDto) {
    const centro = await this.centrosRepo.findOne({
      where: { id: dto.centroMedicoId },
    });
    if (!centro) throw new NotFoundException('Centro médico no existe');

    if (!dto.especialidadesIds?.length) {
      throw new BadRequestException(
        'Debes enviar especialidadesIds con al menos 1 id',
      );
    }

    const especialidades = await this.espRepo.find({
      where: { id: In(dto.especialidadesIds) },
    });

    if (especialidades.length !== dto.especialidadesIds.length) {
      throw new BadRequestException('Alguna especialidadId no existe');
    }

    const medico = this.repo.create({
      nombreCompleto: dto.nombreCompleto,
      centroMedico: centro,
      especialidades,
    });

    return this.repo.save(medico);
  }

  async listar(queryDto: FiltrarMedicosDto) {
    const especialidadId = queryDto.especialidadId;
    const pagina = queryDto.pagina ?? 1;
    const limite = queryDto.limite ?? 10;

    const query = this.repo
      .createQueryBuilder('medico')
      .leftJoinAndSelect('medico.centroMedico', 'centroMedico')
      .leftJoinAndSelect('medico.especialidades', 'especialidad')
      .orderBy('medico.id', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite);

    if (especialidadId) {
      query.andWhere('especialidad.id = :especialidadId', { especialidadId });
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

  async obtenerDisponibilidad(
    medicoId: number,
    fecha: string,
    modalidad: ModalidadAtencion = ModalidadAtencion.PRESENCIAL,
  ) {
    const medico = await this.findOne(medicoId);

    const inicioDia = new Date(`${fecha}T00:00:00`);
    const finDia = new Date(`${fecha}T23:59:59`);

    const bloques = await this.bloquesRepo
      .createQueryBuilder('bloque')
      .where('bloque.medicoId = :medicoId', { medicoId })
      .andWhere('bloque.estado = :estado', { estado: 'DISPONIBLE' })
      .andWhere('bloque.modalidad = :modalidad', { modalidad })
      .andWhere('bloque.inicio >= :inicioDia', { inicioDia })
      .andWhere('bloque.fin <= :finDia', { finDia })
      .orderBy('bloque.inicio', 'ASC')
      .getMany();

    return {
      medico: medico.nombreCompleto,
      fecha,
      modalidad,
      bloques,
    };
  }

  async listarDisponiblesPorEspecialidadYModalidad(
    especialidadId: number,
    modalidad: ModalidadAtencion,
  ) {
    return this.repo
      .createQueryBuilder('medico')
      .leftJoinAndSelect('medico.centroMedico', 'centroMedico')
      .leftJoinAndSelect('medico.especialidades', 'especialidad')
      .leftJoin('bloques_horarios', 'bloque', 'bloque.medicoId = medico.id')
      .where('especialidad.id = :especialidadId', { especialidadId })
      .andWhere('bloque.estado = :estado', { estado: 'DISPONIBLE' })
      .andWhere('bloque.modalidad = :modalidad', { modalidad })
      .orderBy('medico.id', 'ASC')
      .distinct(true)
      .getMany();
  }

  async findOne(id: number) {
    const medico = await this.repo.findOne({
      where: { id },
      relations: { centroMedico: true, especialidades: true },
    });

    if (!medico) throw new NotFoundException('Médico no encontrado');

    return medico;
  }

  async remove(id: number) {
    const medico = await this.findOne(id);
    await this.repo.remove(medico);
    return { ok: true };
  }
}
