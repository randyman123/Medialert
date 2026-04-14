import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GenerarSalaTelemedicinaDto {
  @Type(() => Number)
  @IsInt()
  bloqueHorarioId!: number;
}
