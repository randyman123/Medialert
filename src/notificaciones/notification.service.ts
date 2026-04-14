import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WHATSAPP_PROVIDER,
} from './whatsapp/whatsapp-provider.interface';
import {
  MedicationReminderNotification,
  WhatsAppProviderName,
  WhatsAppSendResult,
} from './whatsapp/whatsapp.types';
import type { WhatsAppProvider } from './whatsapp/whatsapp-provider.interface';

export type { MedicationReminderNotification } from './whatsapp/whatsapp.types';

type ReminderAvailability = {
  allowed: boolean;
  reason: string | null;
};

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsAppProvider,
  ) {}

  canSendMedicationReminder(
    notification: MedicationReminderNotification,
  ): ReminderAvailability {
    if (!this.isWhatsAppEnabled()) {
      return { allowed: false, reason: 'whatsapp_disabled' };
    }

    if (!notification.pacienteTelefono?.trim()) {
      return { allowed: false, reason: 'missing_patient_phone' };
    }

    if (!this.whatsappProvider.isAvailable()) {
      return { allowed: false, reason: 'provider_not_available' };
    }

    return { allowed: true, reason: null };
  }

  async sendMedicationReminder(
    notification: MedicationReminderNotification,
  ): Promise<WhatsAppSendResult> {
    const availability = this.canSendMedicationReminder(notification);

    if (!availability.allowed) {
      this.logger.warn(
        `Recordatorio WhatsApp omitido. medicamentoId=${notification.medicamentoId} motivo=${availability.reason}`,
      );

      return {
        channel: 'whatsapp',
        provider: this.getSelectedProviderName(),
        delivered: false,
        mocked: false,
        deliveredAt: null,
        messageId: null,
        reason: availability.reason,
      };
    }

    return this.whatsappProvider.sendMedicationReminder({
      to: notification.pacienteTelefono!.trim(),
      patientName: notification.pacienteNombre,
      medicationName: notification.nombreMedicamento,
      dosage: notification.dosis,
      scheduledTime: notification.horaMedicamento,
      scheduledDateTime: notification.fechaDosisProgramada,
      reminderDateTime: notification.fechaRecordatorio,
      minutesBefore: notification.minutosAntes,
      reminderType: notification.tipo,
    });
  }

  isWhatsAppEnabled() {
    return this.configService.get<string>('WHATSAPP_ENABLED') === 'true';
  }

  getSelectedProviderName(): WhatsAppProviderName {
    const provider =
      this.configService.get<WhatsAppProviderName>('WHATSAPP_PROVIDER') ?? 'mock';

    return ['mock', 'twilio', 'meta'].includes(provider) ? provider : 'mock';
  }
}
