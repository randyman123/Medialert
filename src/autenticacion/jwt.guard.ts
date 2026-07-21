/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { IS_PUBLIC_KEY } from './public.decorator';

export type JwtUsuario = { id: number; rol: RolUsuario };

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly cfg: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest();

    const auth = req.headers['authorization'] as string | undefined;

    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta token');
    }

    const token = auth.slice('Bearer '.length);

    try {
      const secreto = this.cfg.get<string>('JWT_SECRETO');
      if (!secreto) throw new Error('JWT_SECRETO no configurado');

      const decoded = jwt.verify(token, secreto);

      if (typeof decoded !== 'object' || decoded === null) {
        throw new UnauthorizedException('Token inválido');
      }

      const payload = decoded as { sub?: unknown; rol?: unknown };

      if (typeof payload.rol !== 'string') {
        throw new UnauthorizedException('Token inválido');
      }

      const rawSub = payload.sub;

      const id =
        typeof rawSub === 'number'
          ? rawSub
          : typeof rawSub === 'string'
            ? Number(rawSub)
            : NaN;

      if (!Number.isFinite(id)) {
        throw new UnauthorizedException('Token inválido');
      }

      req.usuario = {
        id,
        rol: payload.rol as RolUsuario,
      } satisfies JwtUsuario;

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
