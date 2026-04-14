import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppProvider } from '../whatsapp-provider.interface';
import {
  WhatsAppMedicationReminderInput,
  WhatsAppSendResult,
} from '../whatsapp.types';

@Injectable()
export class MockWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'mock' as const;
  private readonly logger = new Logger(MockWhatsAppProvider.name);

  isAvailable() {
    return true;
  }

  async sendMedicationReminder(
    input: WhatsAppMedicationReminderInput,
  ): Promise<WhatsAppSendResult> {
    this.logger.log(
      [
        'WhatsApp mock',
        `to=${input.to}`,
        `medication=${input.medicationName}`,
        `scheduledTime=${input.scheduledTime}`,
        `minutesBefore=${input.minutesBefore}`,
        `type=${input.reminderType}`,
      ].join(' | '),
    );

    return {
      channel: 'whatsapp',
      provider: this.name,
      delivered: true,
      mocked: true,
      deliveredAt: new Date().toISOString(),
      messageId: null,
      reason: null,
    };
  }
}
