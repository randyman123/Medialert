import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { PastilleroController } from './pastillero.controller';
import { RecordatorioMedicamento } from './entities/recordatorio-medicamento.entity';
import { PastilleroService } from './pastillero.service';
import { Pastillero } from './entities/pastillero.entity';
import { PastilleroRecordatoriosScheduler } from './pastillero-recordatorios.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pastillero, Paciente, RecordatorioMedicamento]),
    NotificacionesModule,
  ],
  controllers: [PastilleroController],
  providers: [PastilleroService, PastilleroRecordatoriosScheduler],
})
export class PastilleroModule {}
