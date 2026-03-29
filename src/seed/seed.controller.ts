import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { JwtGuard } from '../autenticacion/jwt.guard';
import { RolesGuard } from '../autenticacion/roles.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolUsuario } from '../usuarios/rol-usuario.enum';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('base')
  @ApiOperation({ summary: 'Ejecutar seed base de desarrollo' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  ejecutarSeedBase() {
    return this.seedService.ejecutarSeedBase();
  }
}
