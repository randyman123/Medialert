export type WhatsAppProviderName = 'mock' | 'twilio' | 'meta';

export type MedicationReminderNotification = {
  medicamentoId: number;
  nombreMedicamento: string;
  dosis: string | null;
  pacienteId: number;
  pacienteNombre: string | null;
  pacienteTelefono: string | null;
  fechaDosisProgramada: string;
  fechaRecordatorio: string;
  horaMedicamento: string;
  minutosAntes: number;
  tipo: 'EXACTO' | 'ANTICIPADO';
};

export type WhatsAppMedicationReminderInput = {
  to: string;
  patientName: string | null;
  medicationName: string;
  dosage: string | null;
  scheduledTime: string;
  scheduledDateTime: string;
  reminderDateTime: string;
  minutesBefore: number;
  reminderType: 'EXACTO' | 'ANTICIPADO';
};

export type WhatsAppSendResult = {
  channel: 'whatsapp';
  provider: WhatsAppProviderName;
  delivered: boolean;
  mocked: boolean;
  deliveredAt: string | null;
  messageId: string | null;
  reason: string | null;
};
