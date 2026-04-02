import { IsDateString, IsInt, IsOptional, IsIn, Min } from 'class-validator';
import { ModalidadAtencion } from '../../common/enums/modalidad-atencion.enum';

export class CreateBloquesHorarioDto {
  @IsInt()
  @Min(1)
  medicoId!: number;

  // ISO string: "2026-02-17T12:00:00.000Z"
  @IsDateString()
  inicio!: string;

  @IsDateString()
  fin!: string;

  @IsOptional()
  @IsIn(['DISPONIBLE', 'RESERVADO', 'BLOQUEADO'])
  estado?: 'DISPONIBLE' | 'RESERVADO' | 'BLOQUEADO';

  @IsOptional()
  @IsIn([ModalidadAtencion.PRESENCIAL, ModalidadAtencion.TELEMEDICINA])
  modalidad?: ModalidadAtencion;
}
