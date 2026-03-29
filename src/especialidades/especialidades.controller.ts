import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EspecialidadesService } from './especialidades.service';
import { CreateEspecialidadeDto } from './dto/create-especialidade.dto';
import { JwtGuard } from '../autenticacion/jwt.guard';
import { RolesGuard } from '../autenticacion/roles.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { ApiQuery } from '@nestjs/swagger';

@ApiTags('especialidades')
@Controller('especialidades')
export class EspecialidadesController {
  constructor(private readonly especialidadesService: EspecialidadesService) {}

  // ✅ Público (para el front): listar especialidades
  @Get()
  listar() {
    return this.especialidadesService.findAll();
  }

  // ✅ Público: obtener una especialidad
  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.especialidadesService.findOne(id);
  }

  @Get(':id/fechas-disponibles')
  fechasDisponibles(@Param('id', ParseIntPipe) id: number) {
    return this.especialidadesService.obtenerFechasDisponibles(id);
  }

  // 🔒 Solo ADMIN/RECEPCION: crear especialidad
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCION)
  crear(@Body() dto: CreateEspecialidadeDto) {
    return this.especialidadesService.create(dto);
  }

  // 🔒 Solo ADMIN/RECEPCION: eliminar especialidad
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCION)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.especialidadesService.remove(id);
  }
  @Get(':id/medicos-disponibles')
  @ApiQuery({ name: 'fecha', required: true, example: '2026-03-15' })
  medicosDisponibles(
    @Param('id', ParseIntPipe) id: number,
    @Query('fecha') fecha: string,
  ) {
    return this.especialidadesService.obtenerMedicosDisponibles(id, fecha);
  }
}
