import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { JwtGuard } from '../autenticacion/jwt.guard';
import { RolesGuard } from '../autenticacion/roles.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolUsuario } from '../usuarios/rol-usuario.enum';

@ApiTags('auditoria')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly servicio: AuditoriaService) {}

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCION)
  listar(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : 50;
    return this.servicio.listar(Number.isFinite(n) ? n : 50);
  }
}
