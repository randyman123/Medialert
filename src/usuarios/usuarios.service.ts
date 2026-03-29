import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { RolUsuario } from './rol-usuario.enum';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario) private readonly repo: Repository<Usuario>,
  ) {}

  async buscarPorCorreo(correo: string) {
    return this.repo.findOne({
      where: { correo },
    });
  }

  async buscarPorCorreoConHash(correo: string) {
    return this.repo
      .createQueryBuilder('usuario')
      .addSelect('usuario.hashContrasena')
      .where('usuario.correo = :correo', { correo })
      .getOne();
  }

  async buscarPorId(id: number) {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async cambiarRol(id: number, rol: RolUsuario) {
    const u = await this.buscarPorId(id);
    u.rol = rol;
    return this.repo.save(u);
  }

  async cambiarActivo(id: number, activo: boolean) {
    const u = await this.buscarPorId(id);
    u.activo = activo;
    return this.repo.save(u);
  }
  async crearPaciente(correo: string, hashContrasena: string) {
    const usuario = this.repo.create({
      correo,
      hashContrasena,
      rol: RolUsuario.PACIENTE,
      activo: true,
    });

    return this.repo.save(usuario);
  }
}
