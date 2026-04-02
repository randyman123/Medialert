import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtUsuario } from '../autenticacion/jwt.guard';
import { ModalidadAtencion } from '../common/enums/modalidad-atencion.enum';
import { EspecialidadesService } from '../especialidades/especialidades.service';
import { MedicosService } from '../medicos/medicos.service';
import { ReservasService } from '../reservas/reservas.service';
import { CrearReservaTelemedicinaDto } from './dto/crear-reserva-telemedicina.dto';

@Injectable()
export class TelemedicinaService {
  constructor(
    private readonly especialidadesService: EspecialidadesService,
    private readonly medicosService: MedicosService,
    private readonly reservasService: ReservasService,
  ) {}

  listarEspecialidades() {
    return this.especialidadesService.findAllDisponiblesPorModalidad(
      ModalidadAtencion.TELEMEDICINA,
    );
  }

  async listarMedicos(especialidadId: number) {
    await this.especialidadesService.findOne(especialidadId);

    const medicos =
      await this.medicosService.listarDisponiblesPorEspecialidadYModalidad(
        especialidadId,
        ModalidadAtencion.TELEMEDICINA,
      );

    return {
      especialidadId,
      modalidad: ModalidadAtencion.TELEMEDICINA,
      medicos,
    };
  }

  listarHorarios(medicoId: number, fecha: string) {
    if (!fecha) {
      throw new BadRequestException('Debe indicar la fecha');
    }

    return this.medicosService.obtenerDisponibilidad(
      medicoId,
      fecha,
      ModalidadAtencion.TELEMEDICINA,
    );
  }

  reservar(dto: CrearReservaTelemedicinaDto, usuario: JwtUsuario) {
    return this.reservasService.crearTelemedicina(dto, usuario);
  }
}
