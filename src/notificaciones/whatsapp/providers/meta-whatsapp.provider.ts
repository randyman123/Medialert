import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsAppProvider } from '../whatsapp-provider.interface';
import {
  WhatsAppMedicationReminderInput,
  WhatsAppSendResult,
} from '../whatsapp.types';

@Injectable()
export class MetaWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'meta' as const;
  private readonly logger = new Logger(MetaWhatsAppProvider.name);

  constructor(private readonly configService: ConfigService) {}

  isAvailable() {
    return Boolean(
      this.configService.get<string>('WHATSAPP_META_ACCESS_TOKEN') &&
        this.configService.get<string>('WHATSAPP_META_PHONE_NUMBER_ID'),
    );
  }

  async sendMedicationReminder(
    _input: WhatsAppMedicationReminderInput,
  ): Promise<WhatsAppSendResult> {
    this.logger.warn(
      'Meta WhatsApp provider configurado como placeholder. La llamada real aun no esta implementada.',
    );

    return {
      channel: 'whatsapp',
      provider: this.name,
      delivered: false,
      mocked: false,
      deliveredAt: null,
      messageId: null,
      reason: 'meta_provider_not_implemented',
    };
  }
}
