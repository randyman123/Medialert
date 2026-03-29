import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaController } from './agenda.controller';
import { AgendaService } from './agenda.service';
import { BloqueHorario } from '../bloques-horarios/entities/bloques-horario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BloqueHorario])],
  controllers: [AgendaController],
  providers: [AgendaService],
})
export class AgendaModule {}
