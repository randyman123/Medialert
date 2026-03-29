import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AgendaService } from './agenda.service';

@ApiTags('agenda')
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  @ApiQuery({ name: 'medicoId', required: true, example: 1 })
  @ApiQuery({ name: 'fecha', required: true, example: '2026-03-16' })
  obtenerAgenda(
    @Query('medicoId') medicoId: string,
    @Query('fecha') fecha: string,
  ) {
    return this.agendaService.obtenerAgenda(Number(medicoId), fecha);
  }
}
