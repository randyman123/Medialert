import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './entities/paciente.entity';
import { PaginacionDto } from '../common/dto/paginacion.dto';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private readonly repo: Repository<Paciente>,
  ) {}

  async listar(paginacionDto: PaginacionDto) {
    const pagina = paginacionDto.pagina ?? 1;
    const limite = paginacionDto.limite ?? 10;

    const [datos, total] = await this.repo.findAndCount({
      relations: { usuario: true },
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

  async findOne(id: number) {
    const paciente = await this.repo.findOne({
      where: { id },
      relations: { usuario: true },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return paciente;
  }
}
