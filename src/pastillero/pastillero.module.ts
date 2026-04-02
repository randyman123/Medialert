import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { PastilleroController } from './pastillero.controller';
import { PastilleroService } from './pastillero.service';
import { Pastillero } from './entities/pastillero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pastillero, Paciente])],
  controllers: [PastilleroController],
  providers: [PastilleroService],
})
export class PastilleroModule {}
