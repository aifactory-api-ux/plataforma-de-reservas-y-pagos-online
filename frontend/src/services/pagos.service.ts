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
    return apiFetch.post<WebpayInitResponse>('/pagos/webpay/init', request);
  }

  async confirmWebpayPayment(reservaId: number, token: string): Promise<Reserva> {
    return apiFetch.post<Reserva>('/pagos/webpay/confirm', {
      reservaId,
      token,
    });
  }

  async initSplitPayment(request: SplitPaymentRequest): Promise<void> {
    await apiFetch.post('/pagos/split', {
      reservaId: request.reservaId,
      cantidad: request.cantidadJugadores,
    });
  }

  async getPago(pagoId: number): Promise<Pago> {
    return apiFetch.get<Pago>(`/pagos/${pagoId}`);
  }

  async getPagosByReserva(reservaId: number): Promise<Pago[]> {
    return apiFetch.get<Pago[]>(`/pagos/reserva/${reservaId}`);
  }

  async requestDevolucion(request: DevolucionRequest): Promise<Devolucion> {
    return apiFetch.post<Devolucion>('/pagos/devolucion', request);
  }

  async getPagosPendientes(): Promise<Pago[]> {
    return apiFetch.get<Pago[]>('/pagos/pendientes');
  }

  async ConciliarPago(pagoId: number): Promise<Pago> {
    return apiFetch.post<Pago>(`/pagos/${pagoId}/conciliar`, {});
  }
}

export const pagosService = new PagosService();
