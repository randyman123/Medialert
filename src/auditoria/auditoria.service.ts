import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroAuditoria } from './entities/registro-auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(RegistroAuditoria)
    private readonly repo: Repository<RegistroAuditoria>,
  ) {}

  registrar(data: Partial<RegistroAuditoria>) {
    return this.repo.save(this.repo.create(data));
  }

  listar(limit = 50) {
    return this.repo.find({
      order: { id: 'DESC' },
      take: limit,
    });
  }
}
