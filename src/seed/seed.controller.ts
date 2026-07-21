import { Controller, ForbiddenException, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { JwtGuard } from '../autenticacion/jwt.guard';
import { RolesGuard } from '../autenticacion/roles.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolUsuario } from '../usuarios/rol-usuario.enum';
import { Public } from '../autenticacion/public.decorator';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(
    private readonly seedService: SeedService,
    private readonly configService: ConfigService,
  ) {}

  @Post('base')
  @ApiOperation({ summary: 'Ejecutar seed base de desarrollo' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  ejecutarSeedBase() {
    return this.seedService.ejecutarSeedBase();
  }

  @Post('bootstrap')
  @Public()
  @ApiOperation({
    summary:
      'Inicializar seed base sin autenticacion solo cuando SEED_BOOTSTRAP_ENABLED=true',
  })
  ejecutarSeedBootstrap() {
    const enabled =
      this.configService.get<string>('SEED_BOOTSTRAP_ENABLED') === 'true';

    if (!enabled) {
      throw new ForbiddenException('Seed bootstrap deshabilitado');
    }

    return this.seedService.ejecutarSeedBase();
  }
}
