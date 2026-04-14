import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelemedicinaVideoProvider } from '../video-provider.interface';
import {
  TelemedicinaRoomRequest,
  TelemedicinaRoomResult,
} from '../video.types';

type DailyCreateRoomResponse = {
  name: string;
  url: string;
};

@Injectable()
export class DailyTelemedicinaVideoProvider
  implements TelemedicinaVideoProvider
{
  readonly name = 'daily' as const;
  private readonly logger = new Logger(DailyTelemedicinaVideoProvider.name);

  constructor(private readonly configService: ConfigService) {}

  isAvailable() {
    return Boolean(
      this.configService.get<string>('TELEMEDICINA_VIDEO_DAILY_API_KEY') &&
        this.configService.get<string>('TELEMEDICINA_VIDEO_DAILY_DOMAIN'),
    );
  }

  async createRoom(
    input: TelemedicinaRoomRequest,
  ): Promise<TelemedicinaRoomResult> {
    const apiKey = this.configService.get<string>(
      'TELEMEDICINA_VIDEO_DAILY_API_KEY',
    );
    const domain = this.configService.get<string>(
      'TELEMEDICINA_VIDEO_DAILY_DOMAIN',
    );

    if (!apiKey || !domain) {
      throw new Error('Daily no está configurado');
    }

    const roomName = this.buildRoomName(input);
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          enable_chat: true,
          enable_people_ui: true,
          eject_at_room_exp: true,
          exp: Math.floor(
            new Date(input.scheduledEndAt).getTime() / 1000 + 60 * 60,
          ),
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Daily devolvió ${response.status}: ${errorText || 'sin detalle'}`,
      );
      throw new Error('No se pudo crear la sala de telemedicina en Daily');
    }

    const data = (await response.json()) as DailyCreateRoomResponse;

    return {
      provider: this.name,
      roomName: data.name ?? roomName,
      roomUrl: data.url ?? `https://${domain}/${roomName}`,
      mocked: false,
    };
  }

  private buildRoomName(input: TelemedicinaRoomRequest) {
    const suffix = input.reservaId ?? input.bloqueHorarioId;
    return `medialert-telemedicina-${suffix}`;
  }
}
