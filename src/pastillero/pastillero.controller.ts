import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard, JwtUsuario } from '../autenticacion/jwt.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolesGuard } from '../autenticacion/roles.guard';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { ActualizarMedicamentoDto } from './dto/actualizar-medicamento.dto';
import { CrearMedicamentoDto } from './dto/crear-medicamento.dto';
import {
  MedicamentoResponseDto,
  PastilleroEliminadoResponseDto,
} from './dto/medicamento-response.dto';
import { PastilleroService } from './pastillero.service';

@ApiTags('pastillero')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('pastillero')
export class PastilleroController {
  constructor(private readonly pastilleroService: PastilleroService) {}

  @Post()
  @Roles(RolUsuario.PACIENTE)
  @ApiOperation({ summary: 'Registrar un medicamento del paciente autenticado' })
  @ApiCreatedResponse({ type: MedicamentoResponseDto })
  crear(
    @Body() dto: CrearMedicamentoDto,
    @Req() req: { usuario: JwtUsuario },
  ) {
    return this.pastilleroService.crear(dto, req.usuario);
  }

  @Get('mis')
  @Roles(RolUsuario.PACIENTE)
  @ApiOperation({ summary: 'Listar medicamentos activos del paciente autenticado' })
  @ApiOkResponse({ type: MedicamentoResponseDto, isArray: true })
  listarMis(@Req() req: { usuario: JwtUsuario }) {
    return this.pastilleroService.listarMisActivos(req.usuario);
  }

  @Get(':id')
  @Roles(RolUsuario.PACIENTE)
  @ApiOperation({ summary: 'Ver detalle de un medicamento propio' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ type: MedicamentoResponseDto })
  obtener(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { usuario: JwtUsuario },
  ) {
    return this.pastilleroService.obtenerDetalle(id, req.usuario);
  }

  @Patch(':id')
  @Roles(RolUsuario.PACIENTE)
  @ApiOperation({ summary: 'Actualizar un medicamento propio' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ type: MedicamentoResponseDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarMedicamentoDto,
    @Req() req: { usuario: JwtUsuario },
  ) {
    return this.pastilleroService.actualizar(id, dto, req.usuario);
  }

  @Delete(':id')
  @Roles(RolUsuario.PACIENTE)
  @ApiOperation({ summary: 'Desactivar un medicamento propio' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ type: PastilleroEliminadoResponseDto })
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { usuario: JwtUsuario },
  ) {
    return this.pastilleroService.eliminar(id, req.usuario);
  }
}
