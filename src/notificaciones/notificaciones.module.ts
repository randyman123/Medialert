import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { WHATSAPP_PROVIDER } from './whatsapp/whatsapp-provider.interface';
import { MetaWhatsAppProvider } from './whatsapp/providers/meta-whatsapp.provider';
import { MockWhatsAppProvider } from './whatsapp/providers/mock-whatsapp.provider';
import { TwilioWhatsAppProvider } from './whatsapp/providers/twilio-whatsapp.provider';

@Module({
  providers: [
    NotificationService,
    MockWhatsAppProvider,
    TwilioWhatsAppProvider,
    MetaWhatsAppProvider,
    {
      provide: WHATSAPP_PROVIDER,
      inject: [
        ConfigService,
        MockWhatsAppProvider,
        TwilioWhatsAppProvider,
        MetaWhatsAppProvider,
      ],
      useFactory: (
        configService: ConfigService,
        mockProvider: MockWhatsAppProvider,
        twilioProvider: TwilioWhatsAppProvider,
        metaProvider: MetaWhatsAppProvider,
      ) => {
        const provider = configService.get<string>('WHATSAPP_PROVIDER') ?? 'mock';

        if (provider === 'twilio') {
          return twilioProvider;
        }

        if (provider === 'meta') {
          return metaProvider;
        }

        return mockProvider;
      },
    },
  ],
  exports: [NotificationService],
})
export class NotificacionesModule {}
