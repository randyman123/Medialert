import { IsString, MinLength } from 'class-validator';

export class CrearCentroMedicoDto {
  @IsString()
  @MinLength(3)
  nombre!: string;

  @IsString()
  @MinLength(5)
  direccion!: string;
}
