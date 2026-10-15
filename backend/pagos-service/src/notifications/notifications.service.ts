import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

export interface ReservaConfirmadaNotification {
  jugadorNombre: string;
  jugadorEmail: string;
  jugadorTelefono: string;
  canchaNombre: string;
  sedeNombre: string;
  deporte: string;
  fecha: string;
  hora: string;
  monto: number;
}

export interface ReminderNotification {
  jugadorTelefono: string;
  jugadorNombre: string;
  canchaNombre: string;
  sedeNombre: string;
  fecha: string;
  hora: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly sendgridApiKey: string;
  private readonly sendgridFromEmail: string;
  private readonly whatsappBusinessUrl: string;
  private readonly whatsappToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY') || '';
    this.sendgridFromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@sporty.cl';
    this.whatsappBusinessUrl = this.configService.get<string>('WHATSAPP_BUSINESS_URL') || '';
    this.whatsappToken = this.configService.get<string>('WHATSAPP_BUSINESS_TOKEN') || '';
  }

  async enviarConfirmacionReserva(reserva: any): Promise<void> {
    try {
      const jugador = reserva.jugador;
      const cancha = reserva.cancha;
      const tarifa = reserva.tarifa;

      const fechaReserva = new Date(reserva.inicio);
      const fechaFormateada = fechaReserva.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const horaFormateada = fechaReserva.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const nombreCancha = `Cancha ${cancha.id} - ${cancha.deporte === 'padel' ? 'Pádel' : 'Fútbol 7'}`;
      const nombreSede = 'Sporty';

      await this.enviarEmailConfirmacion({
        jugadorNombre: jugador.nombre,
        jugadorEmail: jugador.email,
        jugadorTelefono: jugador.telefono,
        canchaNombre: nombreCancha,
        sedeNombre: nombreSede,
        deporte: cancha.deporte,
        fecha: fechaFormateada,
        hora: horaFormateada,
        monto: Number(tarifa.monto),
      });

      this.logger.log(`Confirmación enviada a ${jugador.email} para reserva ${reserva.id}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error al enviar confirmación de reserva: ${err.message}`);
    }
  }

  async enviarEmailConfirmacion(data: ReservaConfirmadaNotification): Promise<void> {
    if (!this.sendgridApiKey) {
      this.logger.warn('SendGrid API key no configurado, omitiendo envío de email');
      return;
    }

    try {
      const emailContent = this.construirEmailConfirmacion(data);

      await this.httpService.axiosRef.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [
            {
              to: [{ email: data.jugadorEmail }],
              subject: 'Confirmación de Reserva - Sporty',
            },
          ],
          from: { email: this.sendgridFromEmail, name: 'Sporty' },
          content: [
            {
              type: 'text/html',
              value: emailContent,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Email de confirmación enviado a ${data.jugadorEmail}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error al enviar email: ${err.message}`);
    }
  }

  private construirEmailConfirmacion(data: ReservaConfirmadaNotification): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0B3B22; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
          .label { font-weight: bold; color: #0B3B22; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sporty - Confirmación de Reserva</h1>
          </div>
          <div class="content">
            <p>Hola ${data.jugadorNombre},</p>
            <p>Tu reserva ha sido confirmada exitosamente. Aquí están los detalles:</p>
            <div class="detail">
              <p><span class="label">Cancha:</span> ${data.canchaNombre}</p>
              <p><span class="label">Fecha:</span> ${data.fecha}</p>
              <p><span class="label">Hora:</span> ${data.hora}</p>
              <p><span class="label">Monto Pagado:</span> $${data.monto.toLocaleString('es-CL')}</p>
            </div>
            <p>Te esperamos en nuestras instalaciones.</p>
            <p>Saludos,<br>El equipo de Sporty</p>
          </div>
          <div class="footer">
            <p>Sporty - Gestión de Reservas Deportivas</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async enviarWhatsAppReserva(data: ReservaConfirmadaNotification): Promise<void> {
    if (!this.whatsappToken || !this.whatsappBusinessUrl) {
      this.logger.warn('WhatsApp Business no configurado, omitiendo envío');
      return;
    }

    try {
      const mensaje = this.construirMensajeWhatsApp(data);

      await this.httpService.axiosRef.post(
        this.whatsappBusinessUrl,
        {
          messaging_product: 'whatsapp',
          to: data.jugadorTelefono.replace('+56', '56'),
          type: 'text',
          text: { body: mensaje },
        },
        {
          headers: {
            Authorization: `Bearer ${this.whatsappToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`WhatsApp enviado a ${data.jugadorTelefono}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error al enviar WhatsApp: ${err.message}`);
    }
  }

  private construirMensajeWhatsApp(data: ReservaConfirmadaNotification): string {
    return `🏐 *Sporty - Confirmación de Reserva*

Hola ${data.jugadorNombre}, tu reserva está confirmada:

📅 *Fecha:* ${data.fecha}
🕐 *Hora:* ${data.hora}
🏟️ *Cancha:* ${data.canchaNombre}
💰 *Monto:* $${data.monto.toLocaleString('es-CL')}

¡Te esperamos!`;
  }

  async enviarRecordatorioReserva(data: ReminderNotification): Promise<void> {
    try {
      if (this.whatsappToken && this.whatsappBusinessUrl) {
        const mensaje = this.construirMensajeRecordatorio(data);

        await this.httpService.axiosRef.post(
          this.whatsappBusinessUrl,
          {
            messaging_product: 'whatsapp',
            to: data.jugadorTelefono.replace('+56', '56'),
            type: 'text',
            text: { body: mensaje },
          },
          {
            headers: {
              Authorization: `Bearer ${this.whatsappToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        this.logger.log(`Recordatorio WhatsApp enviado a ${data.jugadorTelefono}`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error al enviar recordatorio: ${err.message}`);
    }
  }

  private construirMensajeRecordatorio(data: ReminderNotification): string {
    return `🏐 *Sporty - Recordatorio de Reserva*

Hola ${data.jugadorNombre},

Te recordamos que tienes una reserva pendiente:

📅 *Fecha:* ${data.fecha}
🕐 *Hora:* ${data.hora}
🏟️ *Cancha:* ${data.canchaNombre}

¡Nos vemos pronto!`;
  }

  async enviarNotificacionDevolucion(
    email: string,
    nombre: string,
    monto: number,
    motivo: string,
  ): Promise<void> {
    if (!this.sendgridApiKey) {
      this.logger.warn('SendGrid API key no configurado');
      return;
    }

    try {
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #C62828; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Sporty - Confirmación de Devolución</h1>
            </div>
            <div class="content">
              <p>Hola ${nombre},</p>
              <p>Se ha procesado tu solicitud de devolución:</p>
              <div class="detail">
                <p><span style="font-weight: bold;">Monto devuelto:</span> $${monto.toLocaleString('es-CL')}</p>
                <p><span style="font-weight: bold;">Motivo:</span> ${motivo}</p>
              </div>
              <p>El reembolso será reflejado en tu cuenta en los próximos 5-10 días hábiles.</p>
              <p>Saludos,<br>El equipo de Sporty</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.httpService.axiosRef.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [
            {
              to: [{ email }],
              subject: 'Confirmación de Devolución - Sporty',
            },
          ],
          from: { email: this.sendgridFromEmail, name: 'Sporty' },
          content: [
            {
              type: 'text/html',
              value: emailContent,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Notificación de devolución enviada a ${email}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error al enviar notificación de devolución: ${err.message}`);
    }
  }
}
