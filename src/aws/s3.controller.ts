import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtGuard } from '../autenticacion/jwt.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolesGuard } from '../autenticacion/roles.guard';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { UploadS3FileDto } from './dto/upload-s3-file.dto';
import type { UploadedBinaryFile } from './interfaces/uploaded-binary-file.interface';
import { S3Service } from './s3.service';

@ApiTags('s3')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Roles(RolUsuario.ADMIN, RolUsuario.RECEPCION)
@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir un archivo al bucket S3 configurado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          example: 'demo-informe.pdf',
        },
        archivo: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['archivo'],
    },
  })
  @UseInterceptors(FileInterceptor('archivo'))
  uploadFile(
    @Body() dto: UploadS3FileDto,
    @UploadedFile() file: UploadedBinaryFile,
  ) {
    return this.s3Service.uploadFile(file, dto.key);
  }

  @Get('files')
  @ApiOperation({ summary: 'Listar archivos del bucket S3 configurado' })
  listFiles() {
    return this.s3Service.listFiles();
  }

  @Get('files/:key')
  @ApiOperation({ summary: 'Descargar un archivo desde S3' })
  @ApiParam({ name: 'key', example: 'demo-informe.pdf' })
  @ApiProduces('application/octet-stream')
  async getFile(
    @Param('key') key: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.s3Service.getFile(key);

    response.setHeader('Content-Type', file.contentType);
    response.setHeader('Content-Length', String(file.contentLength));
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.key)}"`,
    );

    return new StreamableFile(file.body);
  }

  @Delete('files/:key')
  @ApiOperation({ summary: 'Eliminar un archivo del bucket S3 configurado' })
  @ApiParam({ name: 'key', example: 'demo-informe.pdf' })
  deleteFile(@Param('key') key: string) {
    return this.s3Service.deleteFile(key);
  }
}
