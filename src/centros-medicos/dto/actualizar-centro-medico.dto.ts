import { PartialType } from '@nestjs/mapped-types';
import { CrearCentroMedicoDto } from './crear-centro-medico.dto';

export class ActualizarCentroMedicoDto extends PartialType(
  CrearCentroMedicoDto,
) {}
