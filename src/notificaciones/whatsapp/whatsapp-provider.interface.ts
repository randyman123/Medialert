import {
  WhatsAppMedicationReminderInput,
  WhatsAppProviderName,
  WhatsAppSendResult,
} from './whatsapp.types';

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');

export interface WhatsAppProvider {
  readonly name: WhatsAppProviderName;
  isAvailable(): boolean;
  sendMedicationReminder(
    input: WhatsAppMedicationReminderInput,
  ): Promise<WhatsAppSendResult>;
}
