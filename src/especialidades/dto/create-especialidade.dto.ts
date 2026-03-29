import { IsString, MinLength } from 'class-validator';

export class CreateEspecialidadeDto {
  @IsString()
  @MinLength(3)
  nombre!: string;
}
