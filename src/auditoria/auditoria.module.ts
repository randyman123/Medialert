import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { RegistroAuditoria } from './entities/registro-auditoria.entity';
import { AuditoriaListener } from './auditoria.listener';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroAuditoria])],
  controllers: [AuditoriaController],
  providers: [AuditoriaService, AuditoriaListener],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
