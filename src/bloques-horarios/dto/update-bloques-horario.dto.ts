import { PartialType } from '@nestjs/mapped-types';
import { CreateBloquesHorarioDto } from './create-bloques-horario.dto';

export class UpdateBloquesHorarioDto extends PartialType(CreateBloquesHorarioDto) {}
