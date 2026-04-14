import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { access, unlink } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { JwtUsuario } from '../autenticacion/jwt.guard';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { SubirMiArchivoDto } from './dto/subir-mi-archivo.dto';
import { MisArchivo } from './entities/mis-archivo.entity';
import { DIRECTORIO_BASE_MIS_ARCHIVOS } from './mis-archivos.constants';

type ArchivoSubido = {
  originalname: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
};

@Injectable()
export class MisArchivosService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(MisArchivo)
    private readonly archivosRepo: Repository<MisArchivo>,
    @InjectRepository(Paciente)
    private readonly pacientesRepo: Repository<Paciente>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async subir(dto: SubirMiArchivoDto, file: ArchivoSubido, usuario: JwtUsuario) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar un archivo');
    }

    const paciente = await this.buscarPacientePorUsuario(usuario.id);
    const usuarioCreador = await this.buscarUsuario(usuario.id);

    try {
      const rutaRelativa = this.construirRutaRelativa(file.path);

      const archivo = this.archivosRepo.create({
        nombreOriginal: file.originalname,
        nombreInterno: file.filename,
        rutaRelativa,
        tipoMime: file.mimetype,
        tamano: file.size,
        categoria: dto.categoria,
        paciente,
        usuarioCreador,
      });

      const guardado = await this.archivosRepo.save(archivo);

      this.eventEmitter.emit('archivo.subido', {
        archivoId: guardado.id,
        pacienteId: paciente.id,
        usuarioId: usuario.id,
        rol: usuario.rol,
        categoria: guardado.categoria,
        nombreOriginal: guardado.nombreOriginal,
      });

      return this.mapearArchivo(guardado);
    } catch (error) {
      await this.eliminarFisicoSiExiste(file.path);
      throw error;
    }
  }

  async listarMisArchivos(usuario: JwtUsuario) {
    const paciente = await this.buscarPacientePorUsuario(usuario.id);

    const archivos = await this.archivosRepo.find({
      where: { paciente: { id: paciente.id } },
      relations: { paciente: true, usuarioCreador: true },
      order: { fechaSubida: 'DESC', id: 'DESC' },
    });

    return archivos.map((archivo) => this.mapearArchivo(archivo));
  }

  async listarArchivosDePaciente(pacienteId: number) {
    await this.buscarPacientePorId(pacienteId);

    const archivos = await this.archivosRepo.find({
      where: { paciente: { id: pacienteId } },
      relations: { paciente: true, usuarioCreador: true },
      order: { fechaSubida: 'DESC', id: 'DESC' },
    });

    return archivos.map((archivo) => this.mapearArchivo(archivo));
  }

  async obtenerDetalle(id: number, usuario: JwtUsuario) {
    const archivo = await this.buscarArchivoPorId(id);
    await this.validarAcceso(archivo, usuario);

    return this.mapearArchivo(archivo);
  }

  async obtenerDescarga(id: number, usuario: JwtUsuario) {
    const archivo = await this.buscarArchivoPorId(id);
    await this.validarAcceso(archivo, usuario);

    const rutaAbsoluta = join(
      process.cwd(),
      DIRECTORIO_BASE_MIS_ARCHIVOS,
      archivo.rutaRelativa,
    );

    try {
      await access(rutaAbsoluta);
    } catch {
      throw new NotFoundException('Archivo físico no encontrado');
    }

    return {
      rutaAbsoluta,
      nombreOriginal: archivo.nombreOriginal,
      tipoMime: archivo.tipoMime,
    };
  }

  async eliminarPropio(id: number, usuario: JwtUsuario) {
    const archivo = await this.buscarArchivoPorId(id);

    if (usuario.rol !== RolUsuario.PACIENTE) {
      throw new ForbiddenException('Solo pacientes pueden eliminar archivos');
    }

    const pacienteAutenticado = await this.buscarPacientePorUsuario(usuario.id);

    if (archivo.paciente.id !== pacienteAutenticado.id) {
      throw new ForbiddenException('No autorizado para acceder a este archivo');
    }

    const rutaAbsoluta = join(
      process.cwd(),
      DIRECTORIO_BASE_MIS_ARCHIVOS,
      archivo.rutaRelativa,
    );

    await this.eliminarFisicoSiExiste(rutaAbsoluta);
    await this.archivosRepo.remove(archivo);

    this.eventEmitter.emit('archivo.eliminado', {
      archivoId: archivo.id,
      pacienteId: archivo.paciente.id,
      usuarioId: usuario.id,
      rol: usuario.rol,
      categoria: archivo.categoria,
      nombreOriginal: archivo.nombreOriginal,
    });

    return { mensaje: 'Archivo eliminado correctamente' };
  }

  private async buscarPacientePorUsuario(usuarioId: number) {
    const paciente = await this.pacientesRepo.findOne({
      where: { usuario: { id: usuarioId } },
      relations: { usuario: true },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return paciente;
  }

  private async buscarPacientePorId(id: number) {
    const paciente = await this.pacientesRepo.findOne({
      where: { id },
      relations: { usuario: true },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return paciente;
  }

  private async buscarUsuario(id: number) {
    const usuario = await this.usuariosRepo.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  private async buscarArchivoPorId(id: number) {
    const archivo = await this.archivosRepo.findOne({
      where: { id },
      relations: { paciente: { usuario: true }, usuarioCreador: true },
    });

    if (!archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return archivo;
  }

  private async validarAcceso(archivo: MisArchivo, usuario: JwtUsuario) {
    if (
      usuario.rol === RolUsuario.ADMIN ||
      usuario.rol === RolUsuario.RECEPCION
    ) {
      return;
    }

    if (usuario.rol !== RolUsuario.PACIENTE) {
      throw new ForbiddenException('No autorizado para acceder a este archivo');
    }

    const pacienteAutenticado = await this.buscarPacientePorUsuario(usuario.id);

    if (archivo.paciente.id !== pacienteAutenticado.id) {
      throw new ForbiddenException('No autorizado para acceder a este archivo');
    }
  }

  private construirRutaRelativa(rutaAbsoluta: string) {
    const prefijo = join(process.cwd(), DIRECTORIO_BASE_MIS_ARCHIVOS);
    return rutaAbsoluta.replace(`${prefijo}/`, '').replace(`${prefijo}\\`, '');
  }

  private async eliminarFisicoSiExiste(rutaAbsoluta: string) {
    try {
      await unlink(rutaAbsoluta);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  private mapearArchivo(archivo: MisArchivo) {
    return {
      id: archivo.id,
      nombreOriginal: archivo.nombreOriginal,
      nombreInterno: archivo.nombreInterno,
      rutaRelativa: archivo.rutaRelativa,
      tipoMime: archivo.tipoMime,
      tamano: archivo.tamano,
      categoria: archivo.categoria,
      fechaSubida: archivo.fechaSubida,
      pacienteId: archivo.paciente.id,
      usuarioCreadorId: archivo.usuarioCreador.id,
    };
  }
}
