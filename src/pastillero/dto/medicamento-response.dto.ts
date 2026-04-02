import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedicamentoResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Amoxicilina' })
  nombreMedicamento!: string;

  @ApiPropertyOptional({ example: '500mg', nullable: true })
  dosis!: string | null;

  @ApiProperty({ example: '08:00' })
  horaInicio!: string;

  @ApiProperty({ example: '2026-04-02' })
  fechaInicio!: string;

  @ApiProperty({ example: 8 })
  frecuenciaHoras!: number;

  @ApiProperty({ example: 7 })
  duracionDias!: number;

  @ApiProperty({ example: true })
  alarmaActiva!: boolean;

  @ApiPropertyOptional({
    example: 'Tomar despues de las comidas',
    nullable: true,
  })
  observaciones!: string | null;

  @ApiProperty({ example: true })
  activo!: boolean;

  @ApiProperty({ example: 3 })
  pacienteId!: number;

  @ApiProperty({ example: '2026-04-08' })
  fechaFinEstimada!: string;

  @ApiPropertyOptional({
    example: '2026-04-02T16:00:00.000Z',
    nullable: true,
  })
  proximaDosisEstimada!: string | null;

  @ApiProperty({ example: '2026-04-02T13:10:00.000Z' })
  creadoEn!: Date;

  @ApiProperty({ example: '2026-04-02T13:10:00.000Z' })
  actualizadoEn!: Date;
}

export class PastilleroEliminadoResponseDto {
  @ApiProperty({ example: 'Medicamento desactivado correctamente' })
  mensaje!: string;
}
