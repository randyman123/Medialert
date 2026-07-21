import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { CentrosMedicosModule } from './centros-medicos/centros-medicos.module';
import { EspecialidadesModule } from './especialidades/especialidades.module';
import { MedicosModule } from './medicos/medicos.module';
import { BloquesHorariosModule } from './bloques-horarios/bloques-horarios.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { ReservasModule } from './reservas/reservas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SeedModule } from './seed/seed.module';
import { AgendaModule } from './agenda/agenda.module';
import { MisArchivosModule } from './mis-archivos/mis-archivos.module';
import { TelemedicinaModule } from './telemedicina/telemedicina.module';
import { PastilleroModule } from './pastillero/pastillero.module';
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql',
        host: cfg.get<string>('DB_HOST'),
        port: Number(cfg.get<string>('DB_PORT')),
        username: cfg.get<string>('DB_USER'),
        password: cfg.get<string>('DB_PASS'),
        database: cfg.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // por ahora TRUE para avanzar rápido
        dropSchema: false,
      }),
    }),

    CentrosMedicosModule,
    EspecialidadesModule,
    MedicosModule,
    BloquesHorariosModule,
    PacientesModule,
    ReservasModule,
    UsuariosModule,
    AutenticacionModule,
    AuditoriaModule,
    EventEmitterModule.forRoot(),
    SeedModule,
    AgendaModule,
    MisArchivosModule,
    TelemedicinaModule,
    PastilleroModule,
    AwsModule,
  ],
})
export class AppModule {}
