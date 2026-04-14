import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TELEMEDICINA_VIDEO_PROVIDER,
} from './video-provider.interface';
import {
  TelemedicinaRoomRequest,
  TelemedicinaRoomResult,
  TelemedicinaVideoProviderName,
} from './video.types';
import type { TelemedicinaVideoProvider } from './video-provider.interface';

@Injectable()
export class TelemedicinaVideoService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(TELEMEDICINA_VIDEO_PROVIDER)
    private readonly provider: TelemedicinaVideoProvider,
  ) {}

  shouldAutoCreateRoom() {
    return (
      this.configService.get<string>('TELEMEDICINA_VIDEO_AUTO_CREATE') !==
      'false'
    );
  }

  getSelectedProvider(): TelemedicinaVideoProviderName {
    const provider =
      this.configService.get<TelemedicinaVideoProviderName>(
        'TELEMEDICINA_VIDEO_PROVIDER',
      ) ?? 'mock';

    return ['mock', 'daily'].includes(provider) ? provider : 'mock';
  }

  canCreateRoom() {
    return this.provider.isAvailable();
  }

  async createRoom(input: TelemedicinaRoomRequest): Promise<TelemedicinaRoomResult> {
    return this.provider.createRoom(input);
  }
}
