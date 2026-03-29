import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegistrarDto {
  @IsString()
  @MinLength(3)
  nombreCompleto!: string;

  @IsEmail()
  correo!: string;

  @IsString()
  @MinLength(6)
  contrasena!: string;
}