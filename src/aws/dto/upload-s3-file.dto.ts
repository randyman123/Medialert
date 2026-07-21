import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadS3FileDto {
  @ApiPropertyOptional({
    description:
      'Clave opcional del objeto. Si no se envía, se genera una automáticamente.',
    example: 'demo-informe.pdf',
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  key?: string;
}
