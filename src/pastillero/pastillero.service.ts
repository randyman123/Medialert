import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtUsuario } from '../autenticacion/jwt.guard';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { ActualizarMedicamentoDto } from './dto/actualizar-medicamento.dto';
import { CrearMedicamentoDto } from './dto/crear-medicamento.dto';
import { Pastillero } from './entities/pastillero.entity';
import {
  calcularFechaFinTratamiento,
  calcularProximaDosis,
  calcularProximoRecordatorio,
  formatearFechaLocal,
} from './pastillero-fechas';

@Injectable()
export class PastilleroService {
  constructor(
    @InjectRepository(Pastillero)
    private readonly pastilleroRepo: Repository<Pastillero>,
    @InjectRepository(Paciente)
    private readonly pacientesRepo: Repository<Paciente>,
  ) {}

  async crear(dto: CrearMedicamentoDto, usuario: JwtUsuario) {
    const paciente = await this.buscarPacienteAutenticado(usuario);

    const medicamento = this.pastilleroRepo.create({
      ...dto,
      dosis: dto.dosis ?? null,
      observaciones: dto.observaciones ?? null,
      activo: true,
      recordarMinutosAntes: dto.recordarMinutosAntes ?? 0,
      whatsappRecordatorioActivo: dto.whatsappRecordatorioActivo ?? false,
      paciente,
    });

    const guardado = await this.pastilleroRepo.save(medicamento);
    return this.mapearMedicamento(guardado);
  }

  async listarMisActivos(usuario: JwtUsuario) {
    const paciente = await this.buscarPacienteAutenticado(usuario);

    const medicamentos = await this.pastilleroRepo.find({
      where: { paciente: { id: paciente.id }, activo: true },
      relations: { paciente: true },
      order: { id: 'DESC' },
    });

    return medicamentos.map((medicamento) => this.mapearMedicamento(medicamento));
  }

  async obtenerDetalle(id: number, usuario: JwtUsuario) {
    const medicamento = await this.buscarMedicamentoPropio(id, usuario);
    return this.mapearMedicamento(medicamento);
  }

  async actualizar(
    id: number,
    dto: ActualizarMedicamentoDto,
    usuario: JwtUsuario,
  ) {
    const medicamento = await this.buscarMedicamentoPropio(id, usuario);

    Object.assign(medicamento, {
      ...dto,
      dosis:
        dto.dosis !== undefined ? (dto.dosis ?? null) : medicamento.dosis,
      recordarMinutosAntes:
        dto.recordarMinutosAntes !== undefined
          ? dto.recordarMinutosAntes
          : medicamento.recordarMinutosAntes,
      whatsappRecordatorioActivo:
        dto.whatsappRecordatorioActivo !== undefined
          ? dto.whatsappRecordatorioActivo
          : medicamento.whatsappRecordatorioActivo,
      observaciones:
        dto.observaciones !== undefined
          ? (dto.observaciones ?? null)
          : medicamento.observaciones,
    });

    const actualizado = await this.pastilleroRepo.save(medicamento);
    return this.mapearMedicamento(actualizado);
  }

  async eliminar(id: number, usuario: JwtUsuario) {
    const medicamento = await this.buscarMedicamentoPropio(id, usuario);
    medicamento.activo = false;

    await this.pastilleroRepo.save(medicamento);

    return { mensaje: 'Medicamento desactivado correctamente' };
  }

  private async buscarPacienteAutenticado(usuario: JwtUsuario) {
    if (usuario.rol !== RolUsuario.PACIENTE) {
      throw new ForbiddenException(
        'Solo pacientes pueden gestionar su pastillero',
      );
    }

    const paciente = await this.pacientesRepo.findOne({
      where: { usuario: { id: usuario.id } },
      relations: { usuario: true },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return paciente;
  }

  private async buscarMedicamentoPropio(id: number, usuario: JwtUsuario) {
    const paciente = await this.buscarPacienteAutenticado(usuario);

    const medicamento = await this.pastilleroRepo.findOne({
      where: { id },
    });

    if (!medicamento) {
      throw new NotFoundException('Medicamento no encontrado');
    }

    if (medicamento.paciente.id !== paciente.id) {
      throw new ForbiddenException(
        'No autorizado para acceder a este medicamento',
      );
    }

    return medicamento;
  }

  private mapearMedicamento(medicamento: Pastillero) {
    return {
      id: medicamento.id,
      nombreMedicamento: medicamento.nombreMedicamento,
      dosis: medicamento.dosis,
      horaInicio: medicamento.horaInicio,
      fechaInicio: medicamento.fechaInicio,
      frecuenciaHoras: medicamento.frecuenciaHoras,
      duracionDias: medicamento.duracionDias,
      alarmaActiva: medicamento.alarmaActiva,
      recordarMinutosAntes: medicamento.recordarMinutosAntes,
      whatsappRecordatorioActivo: medicamento.whatsappRecordatorioActivo,
      observaciones: medicamento.observaciones,
      activo: medicamento.activo,
      pacienteId: medicamento.paciente.id,
      creadoEn: medicamento.creadoEn,
      actualizadoEn: medicamento.actualizadoEn,
      fechaFinEstimada: this.calcularFechaFin(medicamento),
      proximaDosisEstimada: this.calcularProximaDosis(medicamento),
      proximoRecordatorioEstimado: this.calcularProximoRecordatorio(medicamento),
    };
  }

  private calcularFechaFin(medicamento: Pastillero) {
    return formatearFechaLocal(calcularFechaFinTratamiento(medicamento));
  }

  private calcularProximaDosis(medicamento: Pastillero) {
    return calcularProximaDosis(medicamento)?.toISOString() ?? null;
  }

  private calcularProximoRecordatorio(medicamento: Pastillero) {
    return calcularProximoRecordatorio(medicamento)?.toISOString() ?? null;
  }
}
