import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsAppProvider } from '../whatsapp-provider.interface';
import {
  WhatsAppMedicationReminderInput,
  WhatsAppSendResult,
} from '../whatsapp.types';

@Injectable()
export class TwilioWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'twilio' as const;
  private readonly logger = new Logger(TwilioWhatsAppProvider.name);

  constructor(private readonly configService: ConfigService) {}

  isAvailable() {
    return Boolean(
      this.configService.get<string>('WHATSAPP_TWILIO_ACCOUNT_SID') &&
        this.configService.get<string>('WHATSAPP_TWILIO_AUTH_TOKEN') &&
        this.configService.get<string>('WHATSAPP_TWILIO_FROM'),
    );
  }

  async sendMedicationReminder(
    _input: WhatsAppMedicationReminderInput,
  ): Promise<WhatsAppSendResult> {
    this.logger.warn(
      'Twilio WhatsApp provider configurado como placeholder. La llamada real aun no esta implementada.',
    );

    return {
      channel: 'whatsapp',
      provider: this.name,
      delivered: false,
      mocked: false,
      deliveredAt: null,
      messageId: null,
      reason: 'twilio_provider_not_implemented',
    };
  }
}
