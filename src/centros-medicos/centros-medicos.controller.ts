import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CentrosMedicosService } from './centros-medicos.service';
import { CrearCentroMedicoDto } from './dto/crear-centro-medico.dto';
import { ActualizarCentroMedicoDto } from './dto/actualizar-centro-medico.dto';

@Controller('centros-medicos')
export class CentrosMedicosController {
  constructor(private readonly servicio: CentrosMedicosService) {}

  @Post()
  crear(@Body() dto: CrearCentroMedicoDto) {
    return this.servicio.crear(dto);
  }

  @Get()
  listar() {
    return this.servicio.listar();
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.servicio.obtener(Number(id));
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarCentroMedicoDto) {
    return this.servicio.actualizar(Number(id), dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(Number(id));
  }
}
