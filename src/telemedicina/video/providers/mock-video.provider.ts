import { Injectable, Logger } from '@nestjs/common';
import { TelemedicinaVideoProvider } from '../video-provider.interface';
import {
  TelemedicinaRoomRequest,
  TelemedicinaRoomResult,
} from '../video.types';

@Injectable()
export class MockTelemedicinaVideoProvider
  implements TelemedicinaVideoProvider
{
  readonly name = 'mock' as const;
  private readonly logger = new Logger(MockTelemedicinaVideoProvider.name);

  isAvailable() {
    return true;
  }

  async createRoom(
    input: TelemedicinaRoomRequest,
  ): Promise<TelemedicinaRoomResult> {
    const roomName = this.buildRoomName(input);
    const roomUrl = `https://demo.daily.co/${roomName}`;

    this.logger.log(
      `Sala mock creada para telemedicina. room=${roomName} bloque=${input.bloqueHorarioId}`,
    );

    return {
      provider: this.name,
      roomName,
      roomUrl,
      mocked: true,
    };
  }

  private buildRoomName(input: TelemedicinaRoomRequest) {
    const suffix = input.reservaId ?? input.bloqueHorarioId;
    return `medialert-telemedicina-${suffix}`;
  }
}
