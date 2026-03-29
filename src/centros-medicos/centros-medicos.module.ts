import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentrosMedicosService } from './centros-medicos.service';
import { CentrosMedicosController } from './centros-medicos.controller';
import { CentroMedico } from './entities/centro-medico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CentroMedico])],
  controllers: [CentrosMedicosController],
  providers: [CentrosMedicosService],
  exports: [TypeOrmModule],
})
export class CentrosMedicosModule {}
