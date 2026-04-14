import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloqueHorario } from '../bloques-horarios/entities/bloques-horario.entity';
import { EspecialidadesModule } from '../especialidades/especialidades.module';
import { MedicosModule } from '../medicos/medicos.module';
import { ReservasModule } from '../reservas/reservas.module';
import { TelemedicinaController } from './telemedicina.controller';
import { TelemedicinaService } from './telemedicina.service';
import { DailyTelemedicinaVideoProvider } from './video/providers/daily-video.provider';
import { MockTelemedicinaVideoProvider } from './video/providers/mock-video.provider';
import { TelemedicinaVideoService } from './video/telemedicina-video.service';
import { TELEMEDICINA_VIDEO_PROVIDER } from './video/video-provider.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([BloqueHorario]),
    EspecialidadesModule,
    MedicosModule,
    ReservasModule,
  ],
  controllers: [TelemedicinaController],
  providers: [
    TelemedicinaService,
    MockTelemedicinaVideoProvider,
    DailyTelemedicinaVideoProvider,
    TelemedicinaVideoService,
    {
      provide: TELEMEDICINA_VIDEO_PROVIDER,
      inject: [
        ConfigService,
        MockTelemedicinaVideoProvider,
        DailyTelemedicinaVideoProvider,
      ],
      useFactory: (
        configService: ConfigService,
        mockProvider: MockTelemedicinaVideoProvider,
        dailyProvider: DailyTelemedicinaVideoProvider,
      ) => {
        const provider =
          configService.get<string>('TELEMEDICINA_VIDEO_PROVIDER') ?? 'mock';

        if (provider === 'daily') {
          return dailyProvider;
        }

        return mockProvider;
      },
    },
  ],
})
export class TelemedicinaModule {}
