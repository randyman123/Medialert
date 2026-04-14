import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

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
  @IsBoolean()
  generarSalaAutomaticamente?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(3)
  observaciones?: string;
}
