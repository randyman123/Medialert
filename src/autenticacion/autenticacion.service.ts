import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistrarDto } from './dto/registrar.dto';
import { LoginDto } from './dto/login.dto';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly cfg: ConfigService,
    @InjectRepository(Paciente)
    private readonly pacientesRepo: Repository<Paciente>,
  ) {}

  private firmarToken(usuario: Usuario) {
    const secreto = this.cfg.get<string>('JWT_SECRETO');
    if (!secreto) throw new Error('JWT_SECRETO no configurado');

    const expira = (this.cfg.get<string>('JWT_EXPIRA') ??
      '8h') as jwt.SignOptions['expiresIn'];

    return jwt.sign({ sub: usuario.id, rol: usuario.rol }, secreto, {
      expiresIn: expira,
    });
  }

  async registrar(dto: RegistrarDto) {
    const existe = await this.usuarios.buscarPorCorreo(dto.correo);
    if (existe) throw new BadRequestException('El correo ya está registrado');

    const hash = await bcrypt.hash(dto.contrasena, 10);

    const usuario = await this.usuarios.crearPaciente(dto.correo, hash);
    const paciente = this.pacientesRepo.create({
      nombreCompleto: dto.nombreCompleto,
      correo: dto.correo,
      usuario,
    });

    await this.pacientesRepo.save(paciente);

    return { accessToken: this.firmarToken(usuario) };
  }
  async login(dto: LoginDto) {
    const usuario = await this.usuarios.buscarPorCorreoConHash(dto.correo);
    if (!usuario || !usuario.activo)
      throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(dto.contrasena, usuario.hashContrasena);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    return { accessToken: this.firmarToken(usuario) };
  }
}
