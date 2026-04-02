import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/jwt.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolesGuard } from '../autenticacion/roles.guard';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { CrearReservaTelemedicinaDto } from './dto/crear-reserva-telemedicina.dto';
import { TelemedicinaService } from './telemedicina.service';

@ApiTags('telemedicina')
@Controller('telemedicina')
export class TelemedicinaController {
  constructor(private readonly telemedicinaService: TelemedicinaService) {}

  @Get('especialidades')
  @ApiOperation({ summary: 'Listar especialidades con disponibilidad de telemedicina' })
  listarEspecialidades() {
    return this.telemedicinaService.listarEspecialidades();
  }

  @Get('medicos/:especialidadId')
  @ApiOperation({ summary: 'Listar medicos con bloques de telemedicina para una especialidad' })
  listarMedicos(
    @Param('especialidadId', ParseIntPipe) especialidadId: number,
  ) {
    return this.telemedicinaService.listarMedicos(especialidadId);
  }

  @Get('horarios/:medicoId')
  @ApiOperation({ summary: 'Listar horarios disponibles de telemedicina para un medico' })
  @ApiQuery({ name: 'fecha', required: true, example: '2026-04-02' })
  listarHorarios(
    @Param('medicoId', ParseIntPipe) medicoId: number,
    @Query('fecha') fecha: string,
  ) {
    return this.telemedicinaService.listarHorarios(medicoId, fecha);
  }

  @Post('reservar')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.PACIENTE, RolUsuario.RECEPCION)
  @ApiOperation({ summary: 'Reservar una hora de telemedicina' })
  reservar(@Body() dto: CrearReservaTelemedicinaDto, @Req() req: any) {
    return this.telemedicinaService.reservar(dto, req.usuario);
  }
}
