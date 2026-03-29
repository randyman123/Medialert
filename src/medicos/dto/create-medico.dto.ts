import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateMedicoDto {
  @IsString()
  @MinLength(3)
  nombreCompleto!: string;

  @Type(() => Number)
  @IsInt()
  centroMedicoId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  especialidadesIds!: number[];
}
