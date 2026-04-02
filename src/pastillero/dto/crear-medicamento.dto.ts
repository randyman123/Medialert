import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsMilitaryTime,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CrearMedicamentoDto {
  @ApiProperty({ example: 'Amoxicilina' })
  @IsString()
  @MinLength(2)
  nombreMedicamento!: string;

  @ApiPropertyOptional({ example: '500mg' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  dosis?: string;

  @ApiProperty({ example: '08:00' })
  @IsMilitaryTime()
  horaInicio!: string;

  @ApiProperty({ example: '2026-04-02' })
  @IsDateString()
  fechaInicio!: string;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(1)
  frecuenciaHoras!: number;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  duracionDias!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  alarmaActiva!: boolean;

  @ApiPropertyOptional({ example: 'Tomar despues de las comidas' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  observaciones?: string;
}
