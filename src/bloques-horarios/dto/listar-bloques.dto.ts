import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListarBloquesDto {
  @IsOptional()
  @IsIn(['DISPONIBLE', 'RESERVADO', 'BLOQUEADO'])
  estado?: 'DISPONIBLE' | 'RESERVADO' | 'BLOQUEADO';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  medicoId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number = 10;
}
