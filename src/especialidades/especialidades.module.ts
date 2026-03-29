import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspecialidadesService } from './especialidades.service';
import { EspecialidadesController } from './especialidades.controller';
import { Especialidad } from './entities/especialidad.entity';
import { BloqueHorario } from 'src/bloques-horarios/entities/bloques-horario.entity';
import { Medico } from 'src/medicos/entities/medico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Especialidad, Medico, BloqueHorario])],
  controllers: [EspecialidadesController],
  providers: [EspecialidadesService],
})
export class EspecialidadesModule {}
