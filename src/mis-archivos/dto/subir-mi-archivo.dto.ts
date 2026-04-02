import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CategoriaArchivo } from '../categoria-archivo.enum';

export class SubirMiArchivoDto {
  @ApiProperty({
    enum: CategoriaArchivo,
    example: CategoriaArchivo.EXAMEN,
  })
  @IsEnum(CategoriaArchivo)
  categoria!: CategoriaArchivo;
}
