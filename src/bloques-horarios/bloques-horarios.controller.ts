import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BloquesHorariosService } from './bloques-horarios.service';
import { CreateBloquesHorarioDto } from './dto/create-bloques-horario.dto';
import { ApiQuery } from '@nestjs/swagger';
import { ListarBloquesDto } from './dto/listar-bloques.dto';

@Controller('bloques-horarios')
export class BloquesHorariosController {
  constructor(private readonly servicio: BloquesHorariosService) {}

  @Post()
  crear(@Body() dto: CreateBloquesHorarioDto) {
    return this.servicio.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'medicoId', required: false })
  @ApiQuery({ name: 'desde', required: false })
  @ApiQuery({ name: 'hasta', required: false })
  @ApiQuery({ name: 'pagina', required: false })
  @ApiQuery({ name: 'limite', required: false })
  listar(
    @Query('estado') estado?: string,
    @Query('medicoId') medicoId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
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
      pagina: paginaNum,
      limite: limiteNum,
    });
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.remove(id);
  }
}
