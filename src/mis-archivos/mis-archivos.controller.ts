import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import type { Response } from 'express';
import { JwtGuard, JwtUsuario } from '../autenticacion/jwt.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolesGuard } from '../autenticacion/roles.guard';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { SubirMiArchivoDto } from './dto/subir-mi-archivo.dto';
import { misArchivosMulterOptions } from './mis-archivos.storage';
import { MisArchivosService } from './mis-archivos.service';

@ApiTags('mis-archivos')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('mis-archivos')
export class MisArchivosController {
  constructor(private readonly misArchivosService: MisArchivosService) {}

  @Post()
  @Roles(RolUsuario.PACIENTE)
  @ApiOperation({ summary: 'Subir un archivo del paciente autenticado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['categoria', 'archivo'],
      properties: {
        categoria: {
          type: 'string',
          enum: ['EXAMEN', 'RECETA', 'ORDEN', 'INFORME', 'OTRO'],
        },
        archivo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('archivo', misArchivosMulterOptions))
  subir(
    @Body() dto: SubirMiArchivoDto,
    @UploadedFile()
    file: {
      originalname: string;
      filename: string;
      path: string;
      mimetype: string;
      size: number;
    },
    @Req() req: { usuario: JwtUsuario },
  ) {
    return this.misArchivosService.subir(dto, file, req.usuario);
  }

  @Get('mis')
  @Roles(RolUsuario.PACIENTE)
  @ApiOperation({ summary: 'Listar archivos del paciente autenticado' })
  listarMis(@Req() req: { usuario: JwtUsuario }) {
    return this.misArchivosService.listarMisArchivos(req.usuario);
  }

  @Get('pacientes/:pacienteId')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCION)
  @ApiOperation({ summary: 'Listar archivos de un paciente' })
  @ApiParam({ name: 'pacienteId', example: 1 })
  listarDePaciente(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.misArchivosService.listarArchivosDePaciente(pacienteId);
  }

  @Get(':id/descargar')
  @Roles(RolUsuario.PACIENTE, RolUsuario.ADMIN, RolUsuario.RECEPCION)
  @ApiOperation({ summary: 'Descargar un archivo protegido' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiProduces('application/octet-stream')
  async descargar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { usuario: JwtUsuario },
    @Res({ passthrough: true }) res: Response,
  ) {
    const archivo = await this.misArchivosService.obtenerDescarga(
      id,
      req.usuario,
    );

    res.setHeader('Content-Type', archivo.tipoMime);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(archivo.nombreOriginal)}"`,
    );

    return new StreamableFile(createReadStream(archivo.rutaAbsoluta));
  }

  @Get(':id')
  @Roles(RolUsuario.PACIENTE, RolUsuario.ADMIN, RolUsuario.RECEPCION)
  @ApiOperation({ summary: 'Ver detalle de un archivo' })
  @ApiParam({ name: 'id', example: 1 })
  detalle(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { usuario: JwtUsuario },
  ) {
    return this.misArchivosService.obtenerDetalle(id, req.usuario);
  }

  @Delete(':id')
  @Roles(RolUsuario.PACIENTE)
  @ApiOperation({ summary: 'Eliminar un archivo propio' })
  @ApiParam({ name: 'id', example: 1 })
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { usuario: JwtUsuario },
  ) {
    return this.misArchivosService.eliminarPropio(id, req.usuario);
  }
}
