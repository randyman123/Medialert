import { Body, Controller, Post } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { RegistrarDto } from './dto/registrar.dto';
import { LoginDto } from './dto/login.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly servicio: AutenticacionService) {}

  @Post('registrar')
  registrar(@Body() dto: RegistrarDto) {
    return this.servicio.registrar(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.servicio.login(dto);
  }
}
