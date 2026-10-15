import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailConfirmacionPago {
  jugadorNombre: string;
  jugadorEmail: string;
  canchaNombre: string;
  sedeNombre: string;
  fecha: string;
  hora: string;
  monto: number;
  referenciaTransbank: string;
}

export interface EmailRecuperacionPassword {
  usuarioEmail: string;
  usuarioNombre: string;
  tokenRecuperacion: string;
  frontendUrl: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly sendgridApiKey: string;
  private readonly sendgridFromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY') || '';
    this.sendgridFromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@sporty.cl';
  }

  async enviarConfirmacionPago(data: EmailConfirmacionPago): Promise<void> {
    if (!this.sendgridApiKey) {
      this.logger.warn('SendGrid API key no configurado, omitiendo envío de email');
      return;
    }

    try {
      const htmlContent = this.construirHtmlConfirmacionPago(data);

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: data.jugadorEmail }],
              subject: 'Confirmación de Pago - Sporty',
            },
          ],
          from: { email: this.sendgridFromEmail, name: 'Sporty' },
          content: [
            {
              type: 'text/html',
              value: htmlContent,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.status}`);
      }

      this.logger.log(`Email de confirmación enviado a ${data.jugadorEmail}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error al enviar email de confirmación: ${err.message}`);
    }
  }

  async enviarRecuperacionPassword(data: EmailRecuperacionPassword): Promise<void> {
    if (!this.sendgridApiKey) {
      this.logger.warn('SendGrid API key no configurado, omitiendo envío de email');
      return;
    }

    try {
      const htmlContent = this.construirHtmlRecuperacionPassword(data);
      const resetUrl = `${data.frontendUrl}/reset-password?token=${data.tokenRecuperacion}`;

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: data.usuarioEmail }],
              subject: 'Recuperación de Contraseña - Sporty',
            },
          ],
          from: { email: this.sendgridFromEmail, name: 'Sporty' },
          content: [
            {
              type: 'text/html',
              value: htmlContent.replace('{{RESET_URL}}', resetUrl),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.status}`);
      }

      this.logger.log(`Email de recuperación enviado a ${data.usuarioEmail}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error al enviar email de recuperación: ${err.message}`);
    }
  }

  private construirHtmlConfirmacionPago(data: EmailConfirmacionPago): string {
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
    .button { display: inline-block; padding: 12px 24px; background: #1C9A58; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sporty - Confirmación de Pago</h1>
    </div>
    <div class="content">
      <p>Hola ${data.jugadorNombre},</p>
      <p>Tu pago ha sido procesado exitosamente. Aquí están los detalles:</p>
      <div class="detail">
        <p><span class="label">Cancha:</span> ${data.canchaNombre}</p>
        <p><span class="label">Sede:</span> ${data.sedeNombre}</p>
        <p><span class="label">Fecha:</span> ${data.fecha}</p>
        <p><span class="label">Hora:</span> ${data.hora}</p>
        <p><span class="label">Monto Pagado:</span> $${data.monto.toLocaleString('es-CL')}</p>
        <p><span class="label">Referencia:</span> ${data.referenciaTransbank}</p>
      </div>
      <p>Tu reserva está confirmada. ¡Te esperamos!</p>
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

  private construirHtmlRecuperacionPassword(data: EmailRecuperacionPassword): string {
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
    .button { display: inline-block; padding: 12px 24px; background: #1C9A58; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .warning { background: #FFF4D6; padding: 10px; border-left: 4px solid #F2A900; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sporty - Recuperación de Contraseña</h1>
    </div>
    <div class="content">
      <p>Hola ${data.usuarioNombre},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón:</p>
      <p style="text-align: center;">
        <a href="{{RESET_URL}}" class="button">Restablecer Contraseña</a>
      </p>
      <div class="warning">
        <p><strong>Nota:</strong> Este enlace expira en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
      </div>
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
}
