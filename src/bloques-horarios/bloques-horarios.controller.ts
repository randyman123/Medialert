import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BloquesHorariosService } from './bloques-horarios.service';
import { CreateBloquesHorarioDto } from './dto/create-bloques-horario.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ListarBloquesDto } from './dto/listar-bloques.dto';
import { JwtGuard } from '../autenticacion/jwt.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolesGuard } from '../autenticacion/roles.guard';
import { RolUsuario } from '../usuarios/rol-usuario.enum';

@ApiTags('bloques-horarios')
@Controller('bloques-horarios')
export class BloquesHorariosController {
  constructor(private readonly servicio: BloquesHorariosService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear bloque horario',
    description: 'Disponible solo para ADMIN y RECEPCION',
  })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCION)
  crear(@Body() dto: CreateBloquesHorarioDto) {
    return this.servicio.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'medicoId', required: false })
  @ApiQuery({ name: 'desde', required: false })
  @ApiQuery({ name: 'hasta', required: false })
  @ApiQuery({
    name: 'modalidad',
    required: false,
    enum: ['PRESENCIAL', 'TELEMEDICINA'],
  })
  @ApiQuery({ name: 'pagina', required: false })
  @ApiQuery({ name: 'limite', required: false })
  listar(
    @Query('estado') estado?: string,
    @Query('medicoId') medicoId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('modalidad') modalidad?: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    const medicoIdNum = medicoId ? Number(medicoId) : undefined;

    const paginaNum = pagina ? Number(pagina) : 1;
    const limiteNum = limite ? Number(limite) : 10;

    return this.servicio.findAll({
      estado,
      medicoId: medicoIdNum,
      desde,
      hasta,
      modalidad,
      pagina: paginaNum,
      limite: limiteNum,
    });
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.remove(id);
  }
}
