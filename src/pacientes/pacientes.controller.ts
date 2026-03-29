import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { PacientesService } from './pacientes.service';
import { PaginacionDto } from '../common/dto/paginacion.dto';

@ApiTags('pacientes')
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @ApiQuery({ name: 'pagina', required: false, example: 1 })
  @ApiQuery({ name: 'limite', required: false, example: 10 })
  @Get()
  listar(@Query() paginacionDto: PaginacionDto) {
    return this.pacientesService.listar(paginacionDto);
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.pacientesService.findOne(id);
  }
}
