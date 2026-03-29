import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloqueHorario } from '../bloques-horarios/entities/bloques-horario.entity';

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(BloqueHorario)
    private readonly bloquesRepo: Repository<BloqueHorario>,
  ) {}

  async obtenerAgenda(medicoId: number, fecha: string) {
    const inicioDia = new Date(`${fecha}T00:00:00`);
    const finDia = new Date(`${fecha}T23:59:59`);

    const bloques = await this.bloquesRepo
      .createQueryBuilder('bloque')
      .where('bloque.medicoId = :medicoId', { medicoId })
      .andWhere('bloque.inicio >= :inicioDia', { inicioDia })
      .andWhere('bloque.fin <= :finDia', { finDia })
      .orderBy('bloque.inicio', 'ASC')
      .getMany();

    return {
      medicoId,
      fecha,
      agenda: bloques,
    };
  }
}
