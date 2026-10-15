import { apiFetch } from './api';
import type {
  WebpayInitRequest,
  WebpayInitResponse,
  SplitPaymentRequest,
  DevolucionRequest,
} from '../types/api';
import type { Reserva, Pago, Devolucion } from '../types/models';

class PagosService {
  async initWebpayPayment(request: WebpayInitRequest): Promise<WebpayInitResponse> {
    return apiFetch.post<WebpayInitResponse>('/api/pagos/webpay/init', request);
  }

  async confirmWebpayPayment(reservaId: number, token: string): Promise<Reserva> {
    return apiFetch.post<Reserva>('/api/pagos/webpay/confirm', {
      reservaId,
      token,
    });
  }

  async initSplitPayment(request: SplitPaymentRequest): Promise<void> {
    await apiFetch.post('/api/pagos/split', {
      reservaId: request.reservaId,
      cantidad: request.cantidadJugadores,
    });
  }

  async getPago(pagoId: number): Promise<Pago> {
    return apiFetch.get<Pago>(`/api/pagos/${pagoId}`);
  }

  async getPagosByReserva(reservaId: number): Promise<Pago[]> {
    return apiFetch.get<Pago[]>(`/api/pagos/reserva/${reservaId}`);
  }

  async requestDevolucion(request: DevolucionRequest): Promise<Devolucion> {
    return apiFetch.post<Devolucion>('/api/pagos/devolucion', request);
  }

  async getPagosPendientes(): Promise<Pago[]> {
    return apiFetch.get<Pago[]>('/api/pagos/pendientes');
  }

  async ConciliarPago(pagoId: number): Promise<Pago> {
    return apiFetch.post<Pago>(`/api/pagos/${pagoId}/conciliar`, {});
  }
}

export const pagosService = new PagosService();
