import {
  TelemedicinaRoomRequest,
  TelemedicinaRoomResult,
} from './video.types';

export const TELEMEDICINA_VIDEO_PROVIDER = Symbol(
  'TELEMEDICINA_VIDEO_PROVIDER',
);

export interface TelemedicinaVideoProvider {
  readonly name: 'mock' | 'daily';
  isAvailable(): boolean;
  createRoom(input: TelemedicinaRoomRequest): Promise<TelemedicinaRoomResult>;
}
