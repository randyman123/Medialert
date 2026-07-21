import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Between, In, Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Especialidad } from '../especialidades/entities/especialidad.entity';
import { CentroMedico } from '../centros-medicos/entities/centro-medico.entity';
import { BloqueHorario } from '../bloques-horarios/entities/bloques-horario.entity';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { ModalidadAtencion } from '../common/enums/modalidad-atencion.enum';
import { Reserva } from '../reservas/entities/reserva.entity';

interface DemoSpecialtyDefinition {
  nombre: string;
  medicos: string[];
}

interface DemoBlockTemplate {
  hora: number;
  minuto: number;
  modalidad: ModalidadAtencion;
}

interface DemoBlockCandidate {
  medico: Medico;
  inicio: Date;
  fin: Date;
  modalidad: ModalidadAtencion;
}

interface DemoReservationDefinition {
  offsetDia: number;
  bloqueIndex: number;
  modalidad: ModalidadAtencion;
  motivo: string;
  observaciones?: string;
}

const DEMO_SPECIALTIES: DemoSpecialtyDefinition[] = [
  {
    nombre: 'Medicina General',
    medicos: ['Dr. Demo MediAlert', 'Dra. Catalina Rojas'],
  },
  {
    nombre: 'Pediatría',
    medicos: ['Dr. Matías González'],
  },
  {
    nombre: 'Cardiología',
    medicos: ['Dra. Valentina Herrera'],
  },
  {
    nombre: 'Dermatología',
    medicos: ['Dr. Nicolás Fuentes'],
  },
  {
    nombre: 'Psicología',
    medicos: ['Dra. Antonia Morales'],
  },
];

const DEMO_BLOCK_TEMPLATES: DemoBlockTemplate[] = [
  { hora: 9, minuto: 0, modalidad: ModalidadAtencion.PRESENCIAL },
  { hora: 9, minuto: 30, modalidad: ModalidadAtencion.PRESENCIAL },
  { hora: 10, minuto: 0, modalidad: ModalidadAtencion.PRESENCIAL },
  { hora: 10, minuto: 30, modalidad: ModalidadAtencion.PRESENCIAL },
  { hora: 11, minuto: 0, modalidad: ModalidadAtencion.PRESENCIAL },
  { hora: 11, minuto: 30, modalidad: ModalidadAtencion.PRESENCIAL },
  { hora: 14, minuto: 0, modalidad: ModalidadAtencion.PRESENCIAL },
  { hora: 14, minuto: 30, modalidad: ModalidadAtencion.PRESENCIAL },
  { hora: 15, minuto: 0, modalidad: ModalidadAtencion.TELEMEDICINA },
  { hora: 15, minuto: 30, modalidad: ModalidadAtencion.TELEMEDICINA },
  { hora: 16, minuto: 0, modalidad: ModalidadAtencion.TELEMEDICINA },
  { hora: 16, minuto: 30, modalidad: ModalidadAtencion.TELEMEDICINA },
];

const DEMO_RESERVATIONS: DemoReservationDefinition[] = [
  {
    offsetDia: 1,
    bloqueIndex: 1,
    modalidad: ModalidadAtencion.PRESENCIAL,
    motivo: 'Control general demo',
    observaciones: 'Reserva demo generada por seed',
  },
  {
    offsetDia: 3,
    bloqueIndex: 8,
    modalidad: ModalidadAtencion.TELEMEDICINA,
    motivo: 'Seguimiento por telemedicina demo',
    observaciones: 'Reserva demo con sala remota de ejemplo',
  },
  {
    offsetDia: 5,
    bloqueIndex: 6,
    modalidad: ModalidadAtencion.PRESENCIAL,
    motivo: 'Evaluación clínica demo',
  },
  {
    offsetDia: 8,
    bloqueIndex: 10,
    modalidad: ModalidadAtencion.TELEMEDICINA,
    motivo: 'Control remoto demo',
    observaciones: 'Usar para capturas de telemedicina',
  },
];

const DEMO_DAYS_AHEAD = 14;

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,

    @InjectRepository(Paciente)
    private readonly pacientesRepo: Repository<Paciente>,

    @InjectRepository(Medico)
    private readonly medicosRepo: Repository<Medico>,

    @InjectRepository(Especialidad)
    private readonly especialidadesRepo: Repository<Especialidad>,

    @InjectRepository(CentroMedico)
    private readonly centrosRepo: Repository<CentroMedico>,

    @InjectRepository(BloqueHorario)
    private readonly bloquesRepo: Repository<BloqueHorario>,

    @InjectRepository(Reserva)
    private readonly reservasRepo: Repository<Reserva>,
  ) {}

  async ejecutarSeedBase() {
    const centro = await this.crearCentroSiNoExiste();
    const especialidades = await this.crearEspecialidadesDemoSiNoExisten();

    const admin = await this.crearUsuarioSiNoExiste(
      'admin@medialert.cl',
      '123456',
      RolUsuario.ADMIN,
    );

    const recepcion = await this.crearUsuarioSiNoExiste(
      'recepcion@medialert.cl',
      '123456',
      RolUsuario.RECEPCION,
    );

    const pacienteUsuario = await this.crearUsuarioSiNoExiste(
      'paciente@medialert.cl',
      '123456',
      RolUsuario.PACIENTE,
    );

    const paciente = await this.crearPacienteSiNoExiste(pacienteUsuario);
    const medicos = await this.crearMedicosDemoSiNoExisten(centro, especialidades);
    const agenda = await this.crearBloquesDemoSiNoExisten(medicos);
    const reservasDemo = await this.crearReservasDemoSiNoExisten(
      paciente,
      medicos,
      agenda.bloquesPorMedico,
    );

    return {
      ok: true,
      message: 'Seed base ejecutado correctamente',
      usuarios: {
        admin: admin.correo,
        recepcion: recepcion.correo,
        paciente: pacienteUsuario.correo,
      },
      demo: {
        especialidades: especialidades.length,
        medicos: medicos.length,
        diasGenerados: DEMO_DAYS_AHEAD,
        bloquesPorDiaPorMedico: DEMO_BLOCK_TEMPLATES.length,
        bloquesCreados: agenda.creados,
        bloquesExistentesReutilizados: agenda.reutilizados,
        bloquesDisponibles:
          agenda.totalPresencialesDisponibles + agenda.totalTelemedicinaDisponibles,
        bloquesPresencialesDisponibles: agenda.totalPresencialesDisponibles,
        bloquesTelemedicinaDisponibles: agenda.totalTelemedicinaDisponibles,
        reservasDemoCreadas: reservasDemo.creadas,
        reservasDemoExistentes: reservasDemo.existentes,
      },
    };
  }

  private async crearCentroSiNoExiste() {
    let centro = await this.centrosRepo.findOne({
      where: { nombre: 'Centro Médico MediAlert' },
    });

    if (!centro) {
      centro = this.centrosRepo.create({
        nombre: 'Centro Médico MediAlert',
        direccion: 'Dirección demo 123',
      });
      await this.centrosRepo.save(centro);
    }

    return centro;
  }

  private async crearEspecialidadesDemoSiNoExisten() {
    const nombres = DEMO_SPECIALTIES.map((item) => item.nombre);
    const existentes = await this.especialidadesRepo.find({
      where: { nombre: In(nombres) },
    });

    const mapa = new Map(existentes.map((item) => [item.nombre, item]));
    const resultado: Especialidad[] = [...existentes];

    for (const definition of DEMO_SPECIALTIES) {
      if (mapa.has(definition.nombre)) {
        continue;
      }

      const especialidad = this.especialidadesRepo.create({
        nombre: definition.nombre,
      });

      const guardada = await this.especialidadesRepo.save(especialidad);
      mapa.set(definition.nombre, guardada);
      resultado.push(guardada);
    }

    return nombres
      .map((nombre) => mapa.get(nombre))
      .filter((item): item is Especialidad => Boolean(item));
  }

  private async crearUsuarioSiNoExiste(
    correo: string,
    contrasena: string,
    rol: RolUsuario,
  ) {
    let usuario = await this.usuariosRepo.findOne({
      where: { correo },
    });

    if (!usuario) {
      const hash = await bcrypt.hash(contrasena, 10);

      usuario = this.usuariosRepo.create({
        correo,
        hashContrasena: hash,
        rol,
        activo: true,
      });

      await this.usuariosRepo.save(usuario);
    }

    return usuario;
  }

  private async crearPacienteSiNoExiste(usuario: Usuario) {
    let paciente = await this.pacientesRepo.findOne({
      where: { usuario: { id: usuario.id } },
      relations: { usuario: true },
    });

    if (!paciente) {
      paciente = this.pacientesRepo.create({
        nombreCompleto: 'Paciente Demo',
        correo: usuario.correo,
        usuario,
      });

      await this.pacientesRepo.save(paciente);
    }

    return paciente;
  }

  private async crearMedicosDemoSiNoExisten(
    centro: CentroMedico,
    especialidades: Especialidad[],
  ) {
    const especialidadesPorNombre = new Map(
      especialidades.map((item) => [item.nombre, item]),
    );

    const medicosMap = new Map<string, Especialidad[]>();

    for (const definition of DEMO_SPECIALTIES) {
      const especialidad = especialidadesPorNombre.get(definition.nombre);
      if (!especialidad) {
        continue;
      }

      for (const nombreMedico of definition.medicos) {
        const actuales = medicosMap.get(nombreMedico) ?? [];
        medicosMap.set(nombreMedico, [...actuales, especialidad]);
      }
    }

    const resultado: Medico[] = [];

    for (const [nombreCompleto, especialidadesMedico] of medicosMap.entries()) {
      let medico = await this.medicosRepo.findOne({
        where: { nombreCompleto },
        relations: { centroMedico: true, especialidades: true },
      });

      if (!medico) {
        medico = this.medicosRepo.create({
          nombreCompleto,
          centroMedico: centro,
          especialidades: especialidadesMedico,
        });

        medico = await this.medicosRepo.save(medico);
      } else {
        const especialidadesActuales = new Map(
          medico.especialidades.map((item) => [item.id, item]),
        );

        let changed = false;
        for (const especialidad of especialidadesMedico) {
          if (!especialidadesActuales.has(especialidad.id)) {
            especialidadesActuales.set(especialidad.id, especialidad);
            changed = true;
          }
        }

        if (!medico.centroMedico || medico.centroMedico.id !== centro.id) {
          medico.centroMedico = centro;
          changed = true;
        }

        if (changed) {
          medico.especialidades = [...especialidadesActuales.values()];
          medico = await this.medicosRepo.save(medico);
        }
      }

      resultado.push(medico);
    }

    return resultado.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
  }

  private async crearBloquesDemoSiNoExisten(medicos: Medico[]) {
    const fechaInicio = this.obtenerInicioAgenda();
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + DEMO_DAYS_AHEAD);
    fechaFin.setMilliseconds(fechaFin.getMilliseconds() - 1);

    const bloquesPorMedico = new Map<number, BloqueHorario[]>();

    let creados = 0;
    let reutilizados = 0;
    let totalPresencialesDisponibles = 0;
    let totalTelemedicinaDisponibles = 0;

    for (const medico of medicos) {
      const candidatos = this.construirBloquesParaMedico(medico, fechaInicio);
      const existentes = await this.bloquesRepo.find({
        where: {
          medico: { id: medico.id },
          inicio: Between(fechaInicio, fechaFin),
        },
        relations: { medico: true },
        order: { inicio: 'ASC' },
      });

      const existentesPorClave = new Map(
        existentes.map((item) => [this.getBlockKey(item), item]),
      );

      const bloquesMedico: BloqueHorario[] = [];

      for (const candidato of candidatos) {
        const key = this.getBlockKey(candidato);
        const existente = existentesPorClave.get(key);

        if (existente) {
          reutilizados += 1;
          bloquesMedico.push(existente);
          continue;
        }

        const nuevo = this.bloquesRepo.create({
          medico,
          inicio: candidato.inicio,
          fin: candidato.fin,
          estado: 'DISPONIBLE',
          modalidad: candidato.modalidad,
        });

        const guardado = await this.bloquesRepo.save(nuevo);
        creados += 1;
        bloquesMedico.push(guardado);
      }

      bloquesMedico.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
      bloquesPorMedico.set(medico.id, bloquesMedico);
    }

    for (const bloques of bloquesPorMedico.values()) {
      for (const bloque of bloques) {
        if (bloque.estado !== 'DISPONIBLE') {
          continue;
        }

        if (bloque.modalidad === ModalidadAtencion.PRESENCIAL) {
          totalPresencialesDisponibles += 1;
        } else {
          totalTelemedicinaDisponibles += 1;
        }
      }
    }

    return {
      creados,
      reutilizados,
      totalPresencialesDisponibles,
      totalTelemedicinaDisponibles,
      bloquesPorMedico,
    };
  }

  private async crearReservasDemoSiNoExisten(
    paciente: Paciente,
    medicos: Medico[],
    bloquesPorMedico: Map<number, BloqueHorario[]>,
  ) {
    const existentes = await this.reservasRepo.find({
      where: { paciente: { id: paciente.id } },
      relations: { bloqueHorario: true, medico: true, paciente: true },
    });

    const reservasPorBloqueId = new Map(
      existentes.map((item) => [item.bloqueHorario.id, item]),
    );

    let creadas = 0;
    let existentesCount = 0;

    for (const [index, definition] of DEMO_RESERVATIONS.entries()) {
      const medico = medicos[index % medicos.length];
      const bloquesMedico = bloquesPorMedico.get(medico.id) ?? [];
      const bloque = this.buscarBloqueDemo(bloquesMedico, definition);

      if (!bloque) {
        continue;
      }

      if (reservasPorBloqueId.has(bloque.id)) {
        existentesCount += 1;
        continue;
      }

      const bloqueConReserva = await this.reservasRepo.findOne({
        where: { bloqueHorario: { id: bloque.id } },
        relations: { bloqueHorario: true },
      });

      if (bloqueConReserva) {
        existentesCount += 1;
        continue;
      }

      const linkTelemedicina =
        definition.modalidad === ModalidadAtencion.TELEMEDICINA
          ? `https://demo.medialert.cl/sala/${bloque.id}`
          : null;

      const reserva = this.reservasRepo.create({
        paciente,
        medico,
        bloqueHorario: bloque,
        estado: 'CONFIRMADA',
        motivo: definition.motivo,
        modalidad: definition.modalidad,
        linkTelemedicina,
        observaciones: definition.observaciones ?? null,
      });

      await this.reservasRepo.save(reserva);

      if (bloque.estado !== 'RESERVADO') {
        bloque.estado = 'RESERVADO';
        await this.bloquesRepo.save(bloque);
      }

      reservasPorBloqueId.set(bloque.id, reserva);
      creadas += 1;
    }

    return {
      creadas,
      existentes: existentesCount,
    };
  }

  private construirBloquesParaMedico(
    medico: Medico,
    fechaInicio: Date,
  ): DemoBlockCandidate[] {
    const bloques: DemoBlockCandidate[] = [];

    for (let dia = 0; dia < DEMO_DAYS_AHEAD; dia += 1) {
      for (const template of DEMO_BLOCK_TEMPLATES) {
        const inicio = new Date(fechaInicio);
        inicio.setDate(fechaInicio.getDate() + dia);
        inicio.setHours(template.hora, template.minuto, 0, 0);

        const fin = new Date(inicio);
        fin.setMinutes(fin.getMinutes() + 30);

        bloques.push({
          medico,
          inicio,
          fin,
          modalidad: template.modalidad,
        });
      }
    }

    return bloques;
  }

  private buscarBloqueDemo(
    bloques: BloqueHorario[],
    definition: DemoReservationDefinition,
  ) {
    const fechaObjetivo = this.obtenerInicioAgenda();
    fechaObjetivo.setDate(fechaObjetivo.getDate() + definition.offsetDia);
    const fechaClave = this.formatDateKey(fechaObjetivo);

    return (
      bloques.find((bloque) => {
        const inicioClave = this.formatDateKey(bloque.inicio);
        return (
          inicioClave === fechaClave &&
          bloque.modalidad === definition.modalidad &&
          this.getTemplateIndexForBlock(bloque) === definition.bloqueIndex
        );
      }) ?? null
    );
  }

  private getTemplateIndexForBlock(bloque: BloqueHorario) {
    return DEMO_BLOCK_TEMPLATES.findIndex(
      (template) =>
        template.hora === bloque.inicio.getHours() &&
        template.minuto === bloque.inicio.getMinutes() &&
        template.modalidad === bloque.modalidad,
    );
  }

  private getBlockKey(block: {
    inicio: Date;
    fin: Date;
    modalidad: ModalidadAtencion;
  }) {
    return `${block.inicio.toISOString()}|${block.fin.toISOString()}|${block.modalidad}`;
  }

  private obtenerInicioAgenda() {
    const fecha = new Date();
    fecha.setHours(0, 0, 0, 0);
    fecha.setDate(fecha.getDate() + 1);
    return fecha;
  }

  private formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
