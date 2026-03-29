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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MedicosService } from './medicos.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { JwtGuard } from '../autenticacion/jwt.guard';
import { RolesGuard } from '../autenticacion/roles.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { FiltrarMedicosDto } from './dto/filtrar-medicos.dto';

@ApiTags('medicos')
@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @ApiQuery({ name: 'especialidadId', required: false, example: 1 })
  @ApiQuery({ name: 'pagina', required: false, example: 1 })
  @ApiQuery({ name: 'limite', required: false, example: 5 })
  @Get()
  listar(@Query() query: FiltrarMedicosDto) {
    return this.medicosService.listar(query);
  }

  @Get(':id/disponibilidad')
  @ApiQuery({ name: 'fecha', required: true, example: '2026-03-16' })
  disponibilidad(
    @Param('id', ParseIntPipe) id: number,
    @Query('fecha') fecha: string,
  ) {
    return this.medicosService.obtenerDisponibilidad(id, fecha);
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCION)
  crear(@Body() dto: CreateMedicoDto) {
    return this.medicosService.create(dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCION)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.remove(id);
  }
}
