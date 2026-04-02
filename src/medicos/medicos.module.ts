import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicosService } from './medicos.service';
import { MedicosController } from './medicos.controller';
import { Medico } from './entities/medico.entity';
import { CentroMedico } from '../centros-medicos/entities/centro-medico.entity';
import { Especialidad } from '../especialidades/entities/especialidad.entity';
import { BloqueHorario } from 'src/bloques-horarios/entities/bloques-horario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Medico,
      CentroMedico,
      Especialidad,
      BloqueHorario,
    ]),
  ],
  controllers: [MedicosController],
  providers: [MedicosService],
  exports: [MedicosService],
})
export class MedicosModule {}
