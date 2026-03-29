import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionController } from './autenticacion.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Module({
  imports: [UsuariosModule, TypeOrmModule.forFeature([Paciente])],
  providers: [AutenticacionService],
  controllers: [AutenticacionController],
})
export class AutenticacionModule {}
