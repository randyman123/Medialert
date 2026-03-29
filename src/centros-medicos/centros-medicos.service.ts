import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CentroMedico } from './entities/centro-medico.entity';
import { CrearCentroMedicoDto } from './dto/crear-centro-medico.dto';
import { ActualizarCentroMedicoDto } from './dto/actualizar-centro-medico.dto';

@Injectable()
export class CentrosMedicosService {
  constructor(
    @InjectRepository(CentroMedico)
    private readonly repo: Repository<CentroMedico>,
  ) {}

  crear(dto: CrearCentroMedicoDto) {
    const nuevo = this.repo.create(dto);
    return this.repo.save(nuevo);
  }

  listar() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async obtener(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Centro médico no encontrado');
    return item;
  }

  async actualizar(id: number, dto: ActualizarCentroMedicoDto) {
    const item = await this.obtener(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async eliminar(id: number) {
    const item = await this.obtener(id);
    await this.repo.remove(item);
    return { ok: true };
  }
}
