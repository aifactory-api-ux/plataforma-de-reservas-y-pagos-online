import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WhatsAppRecordatorio {
  jugadorTelefono: string;
  jugadorNombre: string;
  canchaNombre: string;
  sedeNombre: string;
  fecha: string;
  hora: string;
  deporte: string;
}

export interface WhatsAppConfirmacion {
  jugadorTelefono: string;
  jugadorNombre: string;
  canchaNombre: string;
  sedeNombre: string;
  fecha: string;
  hora: string;
  monto: number;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly whatsappBusinessUrl: string;
  private readonly whatsappToken: string;

  constructor(private readonly configService: ConfigService) {
    this.whatsappBusinessUrl = this.configService.get<string>('WHATSAPP_BUSINESS_URL') || '';
    this.whatsappToken = this.configService.get<string>('WHATSAPP_BUSINESS_TOKEN') || '';
  }

  async enviarRecordatorio3Horas(data: WhatsAppRecordatorio): Promise<void> {
    if (!this.whatsappToken || !this.whatsappBusinessUrl) {
      this.logger.warn('WhatsApp Business no configurado, omitiendo envío');
      return;
    }

    try {
      const mensaje = this.construirMensajeRecordatorio(data);
      await this.enviarMensajeWhatsApp(data.jugadorTelefono, mensaje);
      this.logger.log(`Recordatorio WhatsApp enviado a ${data.jugadorTelefono}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error al enviar recordatorio WhatsApp: ${err.message}`);
    }
  }

  async enviarConfirmacionReserva(data: WhatsAppConfirmacion): Promise<void> {
    if (!this.whatsappToken || !this.whatsappBusinessUrl) {
      this.logger.warn('WhatsApp Business no configurado, omitiendo envío');
      return;
    }

    try {
      const mensaje = this.construirMensajeConfirmacion(data);
      await this.enviarMensajeWhatsApp(data.jugadorTelefono, mensaje);
      this.logger.log(`Confirmación WhatsApp enviada a ${data.jugadorTelefono}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error al enviar confirmación WhatsApp: ${err.message}`);
    }
  }

  async enviarInvitacionPago(
    telefono: string,
    nombreInvitador: string,
    nombreCancha: string,
    montoPorPersona: number,
    linkPago: string,
  ): Promise<void> {
    if (!this.whatsappToken || !this.whatsappBusinessUrl) {
      this.logger.warn('WhatsApp Business no configurado, omitiendo envío');
      return;
    }

    try {
      const mensaje = this.construirMensajeInvitacionPago(
        nombreInvitador,
        nombreCancha,
        montoPorPersona,
        linkPago,
      );
      await this.enviarMensajeWhatsApp(telefono, mensaje);
      this.logger.log(`Invitación de pago enviada a ${telefono}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error al enviar invitación de pago: ${err.message}`);
    }
  }

  private async enviarMensajeWhatsApp(telefono: string, mensaje: string): Promise<void> {
    const numeroDestino = telefono.replace('+56', '56').replace(/\s/g, '');

    const response = await fetch(this.whatsappBusinessUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: numeroDestino,
        type: 'text',
        text: { body: mensaje },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WhatsApp API error: ${response.status} - ${errorText}`);
    }
  }

  private construirMensajeRecordatorio(data: WhatsAppRecordatorio): string {
    const deporteEmoji = data.deporte === 'padel' ? '🏐' : '⚽';
    return `${deporteEmoji} *Sporty - Recordatorio de Reserva*

Hola ${data.jugadorNombre},

Tu reserva es en 3 horas:

📅 *Fecha:* ${data.fecha}
🕐 *Hora:* ${data.hora}
🏟️ *Cancha:* ${data.canchaNombre}
📍 *Sede:* ${data.sedeNombre}

¡Te esperamos!`;
  }

  private construirMensajeConfirmacion(data: WhatsAppConfirmacion): string {
    return `🏐 *Sporty - Reserva Confirmada*

Hola ${data.jugadorNombre}, tu reserva está confirmada:

📅 *Fecha:* ${data.fecha}
🕐 *Hora:* ${data.hora}
🏟️ *Cancha:* ${data.canchaNombre}
💰 *Monto:* $${data.monto.toLocaleString('es-CL')}

¡Te esperamos en ${data.sedeNombre}!`;
  }

  private construirMensajeInvitacionPago(
    nombreInvitador: string,
    nombreCancha: string,
    montoPorPersona: number,
    linkPago: string,
  ): string {
    return `🏐 *Sporty - Invitación a Reserva*

${nombreInvitador} te ha invitado a una reserva de pádel.

🏟️ *Cancha:* ${nombreCancha}
💰 *Tu parte:* $${montoPorPersona.toLocaleString('es-CL')}

Paga aquí: ${linkPago}

¡Confirma tu lugar!`;
  }
}
