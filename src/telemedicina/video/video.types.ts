export type TelemedicinaVideoProviderName = 'mock' | 'daily';

export type TelemedicinaRoomRequest = {
  reservaId?: number;
  bloqueHorarioId: number;
  medicoId: number;
  modalidad: 'TELEMEDICINA';
  scheduledStartAt: string;
  scheduledEndAt: string;
  patientName?: string | null;
  doctorName?: string | null;
};

export type TelemedicinaRoomResult = {
  provider: TelemedicinaVideoProviderName;
  roomName: string;
  roomUrl: string;
  mocked: boolean;
};
