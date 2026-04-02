import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CrearReservaTelemedicinaDto {
  @Type(() => Number)
  @IsInt()
  bloqueHorarioId!: number;

  @IsString()
  @MinLength(3)
  motivo!: string;

  @IsOptional()
  @IsUrl()
  linkTelemedicina?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  observaciones?: string;
}
