import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearPacienteDto {
  @IsString()
  @MinLength(5)
  nombreCompleto!: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;
}
