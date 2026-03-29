import { IsInt, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearReservaDto {
  @Type(() => Number)
  @IsInt()
  bloqueHorarioId!: number;

  @IsString()
  @MinLength(3)
  motivo!: string;
}
