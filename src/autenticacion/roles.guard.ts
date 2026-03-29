import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { JwtUsuario } from './jwt.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<RolUsuario[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!roles?.length) return true;

    const req = ctx.switchToHttp().getRequest();
    const usuario = req.usuario as JwtUsuario | undefined;

    if (!usuario) throw new ForbiddenException('No autenticado');

    if (!roles.includes(usuario.rol)) {
      throw new ForbiddenException('Rol insuficiente');
    }

    return true;
  }
}
