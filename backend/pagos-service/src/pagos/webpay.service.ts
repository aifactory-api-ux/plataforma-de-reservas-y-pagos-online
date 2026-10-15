import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

export interface WebpayTransactionInit {
  token: string;
  url: string;
}

export interface WebpayTransactionResult {
  token: string;
  estado: 'ACEPTADO' | 'RECHAZADO' | 'FAILED';
  codigo: string;
  glosa: string;
  fecha: string;
}

export interface WebpayRefundResult {
  tipo: 'REVERSADO' | 'PARCIAL' | 'TOTAL';
  monto: number;
  saldo: number;
  responseCode: number;
}

@Injectable()
export class WebpayService {
  private readonly logger = new Logger(WebpayService.name);
  private readonly webpayUrl: string;
  private readonly commerceCode: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.webpayUrl = this.configService.get<string>('WEBPAY_URL') || 'https://webpay3gint.transbank.cl';
    this.commerceCode = this.configService.get<string>('WEBPAY_COMMERCE_CODE') || '597044444405';
    this.apiKey = this.configService.get<string>('WEBPAY_API_KEY') || '';
  }

  async crearTransaccion(
    reservaId: number,
    monto: number,
    ordenCompra: string,
    sesionId: string,
  ): Promise<WebpayTransactionInit> {
    try {
      const endpoint = `${this.webpayUrl}/rswebpaytransaction/api/webpay/v1.0/transactions`;

      const body = {
        commerceCode: this.commerceCode,
        buyOrder: ordenCompra,
        sessionId: sesionId,
        amount: monto,
        returnURL: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reservas/pago/confirmar`,
      };

      const response = await this.httpService.axiosRef.post(endpoint, body, {
        headers: {
          'Content-Type': 'application/json',
          'Tbk-Api-Key-Id': this.commerceCode,
          'Tbk-Api-Key-Secret': this.apiKey,
        },
        timeout: 30000,
      });

      return {
        token: response.data.token,
        url: response.data.url,
      };
    } catch (error) {
      this.logger.error('Error al crear transacción Webpay', error);
      throw new BadRequestException('Error al iniciar transacción de pago con Webpay');
    }
  }

  async confirmarTransaccion(token: string): Promise<WebpayTransactionResult> {
    try {
      const endpoint = `${this.webpayUrl}/rswebpaytransaction/api/webpay/v1.0/transactions/${token}`;

      const response = await this.httpService.axiosRef.put(
        endpoint,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Tbk-Api-Key-Id': this.commerceCode,
            'Tbk-Api-Key-Secret': this.apiKey,
          },
          timeout: 30000,
        },
      );

      return {
        token: response.data.token,
        estado: response.data.status,
        codigo: response.data.responseCode?.toString() || '0',
        glosa: response.data.responseDescription || '',
        fecha: response.data.transactionDate || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error al confirmar transacción Webpay', error);
      throw new BadRequestException('Error al confirmar pago con Webpay');
    }
  }

  async reversarTransaccion(token: string, monto: number): Promise<WebpayRefundResult> {
    try {
      const endpoint = `${this.webpayUrl}/rswebpaytransaction/api/webpay/v1.0/transactions/${token}/refunds`;

      const body = {
        amount: monto,
      };

      const response = await this.httpService.axiosRef.post(endpoint, body, {
        headers: {
          'Content-Type': 'application/json',
          'Tbk-Api-Key-Id': this.commerceCode,
          'Tbk-Api-Key-Secret': this.apiKey,
        },
        timeout: 30000,
      });

      return {
        tipo: response.data.type || 'TOTAL',
        monto: response.data.amount || monto,
        saldo: response.data.balance || 0,
        responseCode: response.data.responseCode || 0,
      };
    } catch (error) {
      this.logger.error('Error al reversar transacción Webpay', error);
      throw new BadRequestException('Error al procesar devolución con Webpay');
    }
  }

  async crearTransaccionSplit(
    reservaId: number,
    monto: number,
    ordenCompra: string,
    sesionId: string,
    cantidadDividida: number,
  ): Promise<WebpayTransactionInit> {
    const montoPorJugador = monto / cantidadDividida;

    const transactions: string[] = [];
    for (let i = 0; i < cantidadDividida; i++) {
      const ordenDetalle = `${ordenCompra}_${i + 1}_${cantidadDividida}`;
      const resultado = await this.crearTransaccion(
        reservaId,
        montoPorJugador,
        ordenDetalle,
        `${sesionId}_${i + 1}`,
      );
      transactions.push(resultado.token);
    }

    return {
      token: transactions.join(','),
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reservas/pago/split/confirmar`,
    };
  }
}
