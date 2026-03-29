import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloquesHorariosService } from './bloques-horarios.service';
import { BloquesHorariosController } from './bloques-horarios.controller';
import { BloqueHorario } from './entities/bloques-horario.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BloqueHorario, Medico, Reserva])],
  controllers: [BloquesHorariosController],
  providers: [BloquesHorariosService],
})
export class BloquesHorariosModule {}
