import { Module } from '@nestjs/common';
import { EspecialidadesModule } from '../especialidades/especialidades.module';
import { MedicosModule } from '../medicos/medicos.module';
import { ReservasModule } from '../reservas/reservas.module';
import { TelemedicinaController } from './telemedicina.controller';
import { TelemedicinaService } from './telemedicina.service';

@Module({
  imports: [EspecialidadesModule, MedicosModule, ReservasModule],
  controllers: [TelemedicinaController],
  providers: [TelemedicinaService],
})
export class TelemedicinaModule {}
