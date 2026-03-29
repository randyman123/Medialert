import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistrarDto } from './dto/registrar.dto';
import { LoginDto } from './dto/login.dto';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly cfg: ConfigService,
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

    // Creamos usuario PACIENTE
    const usuario = await this.usuarios.crearPaciente(dto.correo, hash);

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
