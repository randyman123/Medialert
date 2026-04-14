import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Especialidad } from '../especialidades/entities/especialidad.entity';
import { CentroMedico } from '../centros-medicos/entities/centro-medico.entity';
import { BloqueHorario } from '../bloques-horarios/entities/bloques-horario.entity';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { ModalidadAtencion } from '../common/enums/modalidad-atencion.enum';

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
  ) {}

  async ejecutarSeedBase() {
    const centro = await this.crearCentroSiNoExiste();
    const especialidad = await this.crearEspecialidadSiNoExiste();

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

    await this.crearPacienteSiNoExiste(pacienteUsuario);

    const medico = await this.crearMedicoSiNoExiste(centro, especialidad);
    await this.crearBloquesDemoSiNoExisten(medico);

    return {
      ok: true,
      message: 'Seed base ejecutado correctamente',
      usuarios: {
        admin: admin.correo,
        recepcion: recepcion.correo,
        paciente: pacienteUsuario.correo,
      },
      medico: medico.nombreCompleto,
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

  private async crearEspecialidadSiNoExiste() {
    let especialidad = await this.especialidadesRepo.findOne({
      where: { nombre: 'Medicina General' },
    });

    if (!especialidad) {
      especialidad = this.especialidadesRepo.create({
        nombre: 'Medicina General',
      });
      await this.especialidadesRepo.save(especialidad);
    }

    return especialidad;
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

  private async crearMedicoSiNoExiste(
    centro: CentroMedico,
    especialidad: Especialidad,
  ) {
    let medico = await this.medicosRepo.findOne({
      where: { nombreCompleto: 'Dr. Demo MediAlert' },
      relations: { centroMedico: true, especialidades: true },
    });

    if (!medico) {
      medico = this.medicosRepo.create({
        nombreCompleto: 'Dr. Demo MediAlert',
        centroMedico: centro,
        especialidades: [especialidad],
      });

      await this.medicosRepo.save(medico);
    }

    return medico;
  }

  private async crearBloquesDemoSiNoExisten(medico: Medico) {
    const ahora = new Date();
    const fechaBase = new Date(ahora);
    fechaBase.setHours(0, 0, 0, 0);
    fechaBase.setDate(fechaBase.getDate() + 1);

    const diasOffset = [0, 1, 2, 4, 6];
    const horariosPresenciales = [
      { hora: 9, minuto: 0 },
      { hora: 9, minuto: 30 },
      { hora: 10, minuto: 0 },
      { hora: 10, minuto: 30 },
      { hora: 11, minuto: 0 },
    ];
    const horariosTelemedicina = [
      { hora: 15, minuto: 0 },
      { hora: 15, minuto: 30 },
      { hora: 16, minuto: 0 },
    ];

    const construirBloques = (
      horarios: Array<{ hora: number; minuto: number }>,
      modalidad: ModalidadAtencion,
    ) =>
      diasOffset.flatMap((dias) =>
        horarios.map(({ hora, minuto }) => {
          const inicio = new Date(fechaBase);
          inicio.setDate(fechaBase.getDate() + dias);
          inicio.setHours(hora, minuto, 0, 0);

          const fin = new Date(inicio);
          fin.setMinutes(fin.getMinutes() + 30);

          return { inicio, fin, modalidad };
        }),
      );

    const bloquesBase = [
      ...construirBloques(
        horariosPresenciales,
        ModalidadAtencion.PRESENCIAL,
      ),
      ...construirBloques(
        horariosTelemedicina,
        ModalidadAtencion.TELEMEDICINA,
      ),
    ];

    for (const bloque of bloquesBase) {
      const existe = await this.bloquesRepo.findOne({
        where: {
          medico: { id: medico.id },
          inicio: bloque.inicio,
          fin: bloque.fin,
          modalidad: bloque.modalidad,
        },
        relations: { medico: true },
      });

      if (existe) {
        if (existe.estado !== 'DISPONIBLE') {
          existe.estado = 'DISPONIBLE';
          await this.bloquesRepo.save(existe);
        }

        continue;
      }

      if (!existe) {
        const nuevo = this.bloquesRepo.create({
          medico,
          inicio: bloque.inicio,
          fin: bloque.fin,
          estado: 'DISPONIBLE',
          modalidad: bloque.modalidad,
        });

        await this.bloquesRepo.save(nuevo);
      }
    }
  }
}
