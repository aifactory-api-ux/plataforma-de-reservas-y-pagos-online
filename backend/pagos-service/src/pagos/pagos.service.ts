import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pago, PagoEstado } from './entities/pago.entity';
import { Devolucion } from './entities/devolucion.entity';
import { Reserva } from './entities/reserva.entity';
import { WebpayService } from './webpay.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePagoDto, CreatePagoSplitDto } from './dto/pago.dto';

const RESERVATION_STATUS = {
  RETENIDA: 'retenida',
  PAGADA: 'pagada',
  CANCELADA: 'cancelada',
  ASISTIO: 'asistio',
  NO_ASISTIO: 'no_asistio',
} as const;

const USER_ROLES = {
  ENCARGADO: 'encargado',
  PROFESOR: 'profesor',
  ADMINISTRADOR: 'administrador',
} as const;

const ROLE_PERMISSIONS = {
  [USER_ROLES.ENCARGADO]: [
    'reservas.read',
    'reservas.create',
    'reservas.update',
    'agenda.read',
    'jugadores.read',
    'jugadores.update',
    'pagos.read',
    'pagos.create',
    'clases.read',
  ],
  [USER_ROLES.PROFESOR]: [
    'reservas.read',
    'agenda.read',
    'clases.read',
    'clases.create',
    'clases.update',
    'jugadores.read',
  ],
  [USER_ROLES.ADMINISTRADOR]: [
    'reservas.read',
    'reservas.create',
    'reservas.update',
    'reservas.delete',
    'agenda.read',
    'jugadores.read',
    'jugadores.update',
    'jugadores.delete',
    'pagos.read',
    'pagos.update',
    'devoluciones.create',
    'clases.read',
    'clases.create',
    'clases.update',
    'clases.delete',
    'usuarios.read',
    'usuarios.create',
    'usuarios.update',
    'usuarios.delete',
    'sedes.read',
    'sedes.create',
    'sedes.update',
    'canchas.read',
    'canchas.create',
    'canchas.update',
    'tarifas.read',
    'tarifas.create',
    'tarifas.update',
    'reportes.read',
    'reportes.export',
  ],
} as const;

export interface PagoResponse {
  pago: Pago;
  webpayUrl?: string;
  token?: string;
}

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);

  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Devolucion)
    private readonly devolucionRepository: Repository<Devolucion>,
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    private readonly webpayService: WebpayService,
    private readonly notificationsService: NotificationsService,
    private readonly dataSource: DataSource,
  ) {}

  async crearPago(createPagoDto: CreatePagoDto): Promise<PagoResponse> {
    const { reservaId, montoTotal, esParcial } = createPagoDto;

    const reserva = await this.reservaRepository.findOne({
      where: { id: reservaId },
      relations: ['jugador', 'cancha', 'tarifa'],
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${reservaId} no encontrada`);
    }

    if (reserva.estado !== RESERVATION_STATUS.RETENIDA) {
      throw new BadRequestException('La reserva no está en estado retenido');
    }

    const pago = this.pagoRepository.create({
      reservaId,
      montoTotal,
      estado: 'pendiente',
      esParcial: esParcial || false,
    });

    const pagoGuardado = await this.pagoRepository.save(pago);

    const ordenCompra = `RESERVA_${reservaId}_${Date.now()}`;
    const sesionId = `SESSION_${reserva.jugadorId}_${Date.now()}`;

    const webpayResult = await this.webpayService.crearTransaccion(
      reservaId,
      montoTotal,
      ordenCompra,
      sesionId,
    );

    pagoGuardado.tokenTransbank = webpayResult.token;
    await this.pagoRepository.save(pagoGuardado);

    return {
      pago: pagoGuardado,
      webpayUrl: webpayResult.url,
      token: webpayResult.token,
    };
  }

  async crearPagoSplit(createPagoSplitDto: CreatePagoSplitDto): Promise<PagoResponse> {
    const { reservaId, montoTotal, cantidadJugadores } = createPagoSplitDto;

    if (cantidadJugadores < 2 || cantidadJugadores > 4) {
      throw new BadRequestException('El pago dividido debe ser entre 2 y 4 jugadores');
    }

    const reserva = await this.reservaRepository.findOne({
      where: { id: reservaId },
      relations: ['jugador', 'cancha', 'tarifa'],
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${reservaId} no encontrada`);
    }

    if (reserva.estado !== RESERVATION_STATUS.RETENIDA) {
      throw new BadRequestException('La reserva no está en estado retenido');
    }

    const montoPorJugador = montoTotal / cantidadJugadores;

    const pagos: Pago[] = [];
    for (let i = 0; i < cantidadJugadores; i++) {
      const pago = this.pagoRepository.create({
        reservaId,
        montoTotal: montoPorJugador,
        estado: 'pendiente',
        esParcial: true,
      });
      pagos.push(await this.pagoRepository.save(pago));
    }

    const ordenCompra = `SPLIT_${reservaId}_${Date.now()}`;
    const sesionId = `SESSION_SPLIT_${reserva.jugadorId}_${Date.now()}`;

    const webpayResult = await this.webpayService.crearTransaccionSplit(
      reservaId,
      montoTotal,
      ordenCompra,
      sesionId,
      cantidadJugadores,
    );

    const tokens = webpayResult.token.split(',');
    for (let i = 0; i < pagos.length; i++) {
      pagos[i].tokenTransbank = tokens[i] || null;
      await this.pagoRepository.save(pagos[i]);
    }

    return {
      pago: pagos[0],
      webpayUrl: webpayResult.url,
      token: webpayResult.token,
    };
  }

  async confirmarPago(token: string): Promise<Pago> {
    const pago = await this.pagoRepository.findOne({
      where: { tokenTransbank: token },
      relations: ['reserva', 'reserva.jugador', 'reserva.cancha', 'reserva.tarifa'],
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (pago.estado === 'completado') {
      throw new BadRequestException('El pago ya fue confirmado');
    }

    const resultadoWebpay = await this.webpayService.confirmarTransaccion(token);

    if (resultadoWebpay.estado === 'ACEPTADO') {
      pago.estado = 'completado';
      pago.referenciaTransbank = resultadoWebpay.token;
      pago.pagadoEn = new Date();

      await this.pagoRepository.save(pago);

      const reserva = await this.reservaRepository.findOne({
        where: { id: pago.reservaId },
        relations: ['jugador', 'cancha', 'tarifa'],
      });

      if (reserva) {
        reserva.estado = RESERVATION_STATUS.PAGADA;
        reserva.confirmadaEn = new Date();
        await this.reservaRepository.save(reserva);

        if (pago.esParcial) {
          const otrosPagos = await this.pagoRepository.find({
            where: { reservaId: pago.reservaId },
          });

          const todosCompletados = otrosPagos.every((p) => p.estado === 'completado');
          if (!todosCompletados) {
            this.logger.log(`Pago parcial completado para reserva ${reserva.id}, esperando otros pagos`);
          }
        }

        await this.notificationsService.enviarConfirmacionReserva(reserva);
      }
    } else {
      pago.estado = 'fallido';
      await this.pagoRepository.save(pago);
      throw new BadRequestException(`Pago rechazado: ${resultadoWebpay.glosa}`);
    }

    return pago;
  }

  async confirmarPagoSplit(tokens: string[]): Promise<Pago[]> {
    const pagos: Pago[] = [];

    for (const token of tokens) {
      const pago = await this.confirmarPago(token);
      pagos.push(pago);
    }

    const reservaId = pagos[0]?.reservaId;
    if (reservaId) {
      const reserva = await this.reservaRepository.findOne({
        where: { id: reservaId },
        relations: ['jugador', 'cancha', 'tarifa'],
      });

      if (reserva) {
        const todosPagos = await this.pagoRepository.find({
          where: { reservaId },
        });

        const todosCompletados = todosPagos.every((p) => p.estado === 'completado');
        if (todosCompletados) {
          reserva.estado = RESERVATION_STATUS.PAGADA;
          reserva.confirmadaEn = new Date();
          await this.reservaRepository.save(reserva);
          await this.notificationsService.enviarConfirmacionReserva(reserva);
        }
      }
    }

    return pagos;
  }

  async registrarPagoManual(
    reservaId: number,
    montoRecibido: number,
    usuarioId: number,
  ): Promise<Pago> {
    const reserva = await this.reservaRepository.findOne({
      where: { id: reservaId },
      relations: ['jugador', 'cancha', 'tarifa'],
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${reservaId} no encontrada`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pago = queryRunner.manager.create(Pago, {
        reservaId,
        montoTotal: montoRecibido,
        estado: 'completado',
        tokenTransbank: `MANUAL_${Date.now()}`,
        pagadoEn: new Date(),
        esParcial: false,
      });

      const pagoGuardado = await queryRunner.manager.save(pago);

      reserva.estado = RESERVATION_STATUS.PAGADA;
      reserva.confirmadaEn = new Date();
      await queryRunner.manager.save(reserva);

      await queryRunner.commitTransaction();

      await this.notificationsService.enviarConfirmacionReserva(reserva);

      return pagoGuardado;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async procesarDevolucion(
    pagoId: number,
    autorizadoPorId: number,
    monto: number,
    motivo: string | undefined,
    userRole: string,
  ): Promise<Devolucion> {
    const permisosDevolucion = ROLE_PERMISSIONS[USER_ROLES.ADMINISTRADOR];
    if (!permisosDevolucion.includes('devoluciones.create')) {
      throw new ForbiddenException('No tiene permisos para autorizar devoluciones');
    }

    const pago = await this.pagoRepository.findOne({
      where: { id: pagoId },
      relations: ['reserva'],
    });

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${pagoId} no encontrado`);
    }

    if (pago.estado !== 'completado') {
      throw new BadRequestException('Solo se pueden devolver pagos completados');
    }

    if (monto > Number(pago.montoTotal)) {
      throw new BadRequestException('El monto de devolución no puede ser mayor al monto pagado');
    }

    let resultadoWebpay: { tipo: string; monto: number } | null = null;
    if (pago.tokenTransbank && !pago.tokenTransbank.startsWith('MANUAL_')) {
      try {
        resultadoWebpay = await this.webpayService.reversarTransaccion(
          pago.tokenTransbank,
          monto,
        );
      } catch (error) {
        this.logger.warn('No se pudo reversar en Webpay, continuando con registro local');
      }
    }

    const devolucion = this.devolucionRepository.create({
      pagoId,
      autorizadoPorId,
      monto,
      motivo: motivo || 'Devolución procesada',
    });

    const devolucionGuardada = await this.devolucionRepository.save(devolucion);

    pago.estado = monto >= Number(pago.montoTotal) ? 'reembolsado' : 'completado';
    await this.pagoRepository.save(pago);

    if (resultadoWebpay) {
      this.logger.log(`Devolución Webpay procesada: ${JSON.stringify(resultadoWebpay)}`);
    }

    return devolucionGuardada;
  }

  async obtenerPagosPorReserva(reservaId: number): Promise<Pago[]> {
    return this.pagoRepository.find({
      where: { reservaId },
      order: { createdAt: 'ASC' },
    });
  }

  async obtenerPagoPorId(id: number): Promise<Pago> {
    const pago = await this.pagoRepository.findOne({
      where: { id },
      relations: ['reserva', 'reserva.jugador', 'reserva.cancha', 'devolucion'],
    });

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return pago;
  }

  async obtenerDevolucionPorPago(pagoId: number): Promise<Devolucion | null> {
    return this.devolucionRepository.findOne({
      where: { pagoId },
      relations: ['pago'],
    });
  }

  async obtenerPagosPorSede(sedeId: number): Promise<Pago[]> {
    const reservas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .innerJoinAndSelect('reserva.cancha', 'cancha')
      .where('cancha.sedeId = :sedeId', { sedeId })
      .andWhere('reserva.estado IN (:...estados)', {
        estados: [RESERVATION_STATUS.PAGADA, RESERVATION_STATUS.RETENIDA],
      })
      .getMany();

    const reservaIds = reservas.map((r) => r.id);

    if (reservaIds.length === 0) {
      return [];
    }

    return this.pagoRepository
      .createQueryBuilder('pago')
      .innerJoin('pago.reserva', 'reserva')
      .where('pago.reservaId IN (:...reservaIds)', { reservaIds })
      .andWhere('pago.estado = :estado', { estado: 'completado' })
      .orderBy('pago.pagadoEn', 'DESC')
      .getMany();
  }

  async conciliarPagos(): Promise<{ conciliados: number; anomalias: number }> {
    const pagosPendientes = await this.pagoRepository.find({
      where: { estado: 'pendiente' },
      relations: ['reserva'],
    });

    let conciliados = 0;
    let anomalias = 0;

    for (const pago of pagosPendientes) {
      if (!pago.tokenTransbank) {
        anomalias++;
        continue;
      }

      try {
        const resultado = await this.webpayService.confirmarTransaccion(pago.tokenTransbank);

        if (resultado.estado === 'ACEPTADO') {
          pago.estado = 'completado';
          pago.pagadoEn = new Date();
          await this.pagoRepository.save(pago);

          if (pago.reserva) {
            pago.reserva.estado = RESERVATION_STATUS.PAGADA;
            pago.reserva.confirmadaEn = new Date();
            await this.reservaRepository.save(pago.reserva);
          }

          conciliados++;
        } else {
          pago.estado = 'fallido';
          await this.pagoRepository.save(pago);
          anomalias++;
        }
      } catch (error) {
        const err = error as Error;
        this.logger.warn(`Error al conciliar pago ${pago.id}: ${err.message}`);
        anomalias++;
      }
    }

    return { conciliados, anomalias };
  }
}
