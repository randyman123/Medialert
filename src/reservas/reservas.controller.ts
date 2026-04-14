import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReservasService } from './reservas.service';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { JwtGuard } from '../autenticacion/jwt.guard';
import { RolesGuard } from '../autenticacion/roles.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PaginacionDto } from '../common/dto/paginacion.dto';
import { ApiQuery } from '@nestjs/swagger';

@ApiTags('reservas')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('reservas')
export class ReservasController {
  constructor(private readonly servicio: ReservasService) {}

  @Post()
  @Roles(RolUsuario.PACIENTE)
  crear(@Body() dto: CrearReservaDto, @Req() req: any) {
    return this.servicio.crear(dto, req.usuario);
  }

  @ApiQuery({ name: 'pagina', required: false, example: 1 })
  @ApiQuery({ name: 'limite', required: false, example: 5 })
  @Get()
  listar(@Query() paginacionDto: PaginacionDto) {
    return this.servicio.listar(paginacionDto);
  }
  @Patch(':id/cancelar')
  @Roles(RolUsuario.PACIENTE)
  cancelar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.servicio.cancelar(id, req.usuario);
  }
  @Get('mis')
  @Roles(RolUsuario.PACIENTE)
  misReservas(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.servicio.listarMis(req.usuario);
  }
}
