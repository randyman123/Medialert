import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { Reserva } from './entities/reserva.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { BloqueHorario } from '../bloques-horarios/entities/bloques-horario.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Usuario } from '../usuarios/entities/usuario.entity'; // 👈 agrega esto

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reserva,
      Paciente,
      BloqueHorario,
      Medico,
      Usuario, // 👈 y esto
    ]),
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
