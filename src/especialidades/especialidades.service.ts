import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Especialidad } from './entities/especialidad.entity';
import { CreateEspecialidadeDto } from './dto/create-especialidade.dto';
import { Medico } from 'src/medicos/entities/medico.entity';
import { BloqueHorario } from 'src/bloques-horarios/entities/bloques-horario.entity';
import { ModalidadAtencion } from 'src/common/enums/modalidad-atencion.enum';

@Injectable()
export class EspecialidadesService {
  constructor(
    @InjectRepository(Especialidad)
    private readonly repo: Repository<Especialidad>,
    @InjectRepository(Medico)
    private readonly medicosRepo: Repository<Medico>,

    @InjectRepository(BloqueHorario)
    private readonly bloquesRepo: Repository<BloqueHorario>,
  ) {}

  create(dto: CreateEspecialidadeDto) {
    const nueva = this.repo.create(dto);
    return this.repo.save(nueva);
  }

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  findAllDisponiblesPorModalidad(modalidad: ModalidadAtencion) {
    return this.repo
      .createQueryBuilder('especialidad')
      .innerJoin(
        'medicos_especialidades',
        'medicos_especialidades',
        'medicos_especialidades.especialidad_id = especialidad.id',
      )
      .innerJoin(
        'medicos',
        'medico',
        'medico.id = medicos_especialidades.medico_id',
      )
      .innerJoin(
        'bloques_horarios',
        'bloque',
        'bloque.medicoId = medico.id AND bloque.estado = :estado AND bloque.modalidad = :modalidad',
        { estado: 'DISPONIBLE', modalidad },
      )
      .orderBy('especialidad.nombre', 'ASC')
      .distinct(true)
      .getMany();
  }

  async findOne(id: number) {
    const esp = await this.repo.findOne({ where: { id } });
    if (!esp) throw new NotFoundException('Especialidad no encontrada');
    return esp;
  }

  async remove(id: number) {
    const esp = await this.findOne(id);
    await this.repo.remove(esp);
    return { ok: true };
  }

  async obtenerMedicosDisponibles(especialidadId: number, fecha: string) {
    const especialidad = await this.repo.findOne({
      where: { id: especialidadId },
    });

    if (!especialidad) {
      throw new NotFoundException('Especialidad no encontrada');
    }

    const inicioDia = new Date(`${fecha}T00:00:00`);
    const finDia = new Date(`${fecha}T23:59:59`);

    const medicos = await this.medicosRepo
      .createQueryBuilder('medico')
      .leftJoinAndSelect('medico.centroMedico', 'centroMedico')
      .leftJoinAndSelect('medico.especialidades', 'especialidad')
      .leftJoinAndSelect(
        'bloques_horarios',
        'bloque',
        'bloque.medicoId = medico.id',
      )
      .where('especialidad.id = :especialidadId', { especialidadId })
      .andWhere('bloque.estado = :estado', { estado: 'DISPONIBLE' })
      .andWhere('bloque.inicio >= :inicioDia', { inicioDia })
      .andWhere('bloque.fin <= :finDia', { finDia })
      .orderBy('medico.id', 'ASC')
      .distinct(true)
      .getMany();

    return {
      especialidadId: especialidad.id,
      especialidad: especialidad.nombre,
      fecha,
      medicos,
    };
  }

  async obtenerFechasDisponibles(especialidadId: number) {
    const especialidad = await this.repo.findOne({
      where: { id: especialidadId },
    });

    if (!especialidad) {
      throw new NotFoundException('Especialidad no encontrada');
    }

    const fechas = await this.bloquesRepo
      .createQueryBuilder('bloque')
      .select('DATE(bloque.inicio)', 'fecha')
      .leftJoin('bloque.medico', 'medico')
      .leftJoin('medico.especialidades', 'especialidad')
      .where('especialidad.id = :especialidadId', { especialidadId })
      .andWhere('bloque.estado = :estado', { estado: 'DISPONIBLE' })
      .groupBy('DATE(bloque.inicio)')
      .orderBy('DATE(bloque.inicio)', 'ASC')
      .getRawMany();

    return {
      especialidad: especialidad.nombre,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      fechas: fechas.map((f) => f.fecha),
    };
  }
}
