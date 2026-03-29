import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Especialidad } from '../especialidades/entities/especialidad.entity';
import { CentroMedico } from '../centros-medicos/entities/centro-medico.entity';
import { BloqueHorario } from '../bloques-horarios/entities/bloques-horario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Paciente,
      Medico,
      Especialidad,
      CentroMedico,
      BloqueHorario,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
