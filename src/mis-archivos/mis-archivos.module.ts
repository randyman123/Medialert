import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { MisArchivosController } from './mis-archivos.controller';
import { MisArchivo } from './entities/mis-archivo.entity';
import { MisArchivosService } from './mis-archivos.service';

@Module({
  imports: [TypeOrmModule.forFeature([MisArchivo, Paciente, Usuario])],
  controllers: [MisArchivosController],
  providers: [MisArchivosService],
})
export class MisArchivosModule {}
