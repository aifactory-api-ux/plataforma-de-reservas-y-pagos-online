import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { Workbook } from 'exceljs';
import { Reserva } from './entities/reserva.entity';
import { Pago } from './entities/pago.entity';
import { Jugador } from './entities/jugador.entity';
import { Cancha } from './entities/cancha.entity';
import { Tarifa } from './entities/tarifa.entity';
import { BloqueoJugador } from './entities/bloqueo-jugador.entity';
import { Sede } from './entities/sede.entity';

export interface ReporteReservasParams {
  fechaInicio: Date;
  fechaFin: Date;
  sedeId?: number;
  estado?: string;
}

export interface ReportePagosParams {
  fechaInicio: Date;
  fechaFin: Date;
  sedeId?: number;
  estado?: string;
}

export interface ReporteNoShowsParams {
  fechaInicio: Date;
  fechaFin: Date;
  sedeId: number;
}

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
    @InjectRepository(Jugador)
    private jugadorRepository: Repository<Jugador>,
    @InjectRepository(Cancha)
    private canchaRepository: Repository<Cancha>,
    @InjectRepository(Tarifa)
    private tarifaRepository: Repository<Tarifa>,
    @InjectRepository(BloqueoJugador)
    private bloqueoJugadorRepository: Repository<BloqueoJugador>,
    @InjectRepository(Sede)
    private sedeRepository: Repository<Sede>,
  ) {}

  async getReporteReservasExcel(
    params: ReporteReservasParams,
    user: any,
  ): Promise<Buffer> {
    this.validateAdminAccess(user);

    const whereClause: any = {
      inicio: Between(params.fechaInicio, params.fechaFin),
    };

    if (params.sedeId) {
      whereClause.cancha = { sedeId: params.sedeId };
    }

    if (params.estado) {
      whereClause.estado = params.estado;
    }

    const reservas = await this.reservaRepository.find({
      where: whereClause,
      relations: ['jugador', 'cancha', 'cancha.sede', 'tarifa'],
      order: { inicio: 'ASC' },
    });

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Reservas');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Hora Inicio', key: 'horaInicio', width: 12 },
      { header: 'Hora Fin', key: 'horaFin', width: 12 },
      { header: 'Sede', key: 'sede', width: 20 },
      { header: 'Cancha', key: 'cancha', width: 15 },
      { header: 'Deporte', key: 'deporte', width: 12 },
      { header: 'Jugador', key: 'jugador', width: 25 },
      { header: 'Email Jugador', key: 'emailJugador', width: 30 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Monto', key: 'monto', width: 12 },
      { header: 'Fecha Creación', key: 'creadaEn', width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1C9A58' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    reservas.forEach((reserva) => {
      const inicio = new Date(reserva.inicio);
      const fin = new Date(reserva.fin);
      worksheet.addRow({
        id: reserva.id,
        fecha: inicio.toLocaleDateString('es-CL'),
        horaInicio: inicio.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        horaFin: fin.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        sede: reserva.cancha?.sede?.nombre || 'N/A',
        cancha: `${reserva.cancha?.deporte} ${reserva.cancha?.id || ''}`,
        deporte: reserva.cancha?.deporte || 'N/A',
        jugador: reserva.jugador?.nombre || 'N/A',
        emailJugador: reserva.jugador?.email || 'N/A',
        estado: this.translateEstado(reserva.estado),
        monto: reserva.tarifa?.monto || 0,
        creadaEn: new Date(reserva.creadaEn).toLocaleString('es-CL'),
      });
    });

    worksheet.getColumn('monto').numFmt = '"$" #,##0';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer) as Buffer;
  }

  async getReportePagosExcel(
    params: ReportePagosParams,
    user: any,
  ): Promise<Buffer> {
    this.validateAdminAccess(user);

    const whereClause: any = {
      createdAt: Between(params.fechaInicio, params.fechaFin),
    };

    if (params.estado) {
      whereClause.estado = params.estado;
    }

    const pagos = await this.pagoRepository.find({
      where: whereClause,
      relations: ['reserva', 'reserva.jugador', 'reserva.cancha', 'reserva.cancha.sede', 'reserva.tarifa'],
      order: { createdAt: 'ASC' },
    });

    if (params.sedeId) {
      pagos.filter(p => p.reserva?.cancha?.sedeId === params.sedeId);
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Pagos');

    worksheet.columns = [
      { header: 'ID Pago', key: 'id', width: 12 },
      { header: 'ID Reserva', key: 'reservaId', width: 12 },
      { header: 'Fecha Pago', key: 'fechaPago', width: 20 },
      { header: 'Sede', key: 'sede', width: 20 },
      { header: 'Cancha', key: 'cancha', width: 15 },
      { header: 'Jugador', key: 'jugador', width: 25 },
      { header: 'Email Jugador', key: 'emailJugador', width: 30 },
      { header: 'Monto Total', key: 'montoTotal', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Token Transbank', key: 'tokenTransbank', width: 25 },
      { header: 'Referencia Transbank', key: 'referenciaTransbank', width: 25 },
      { header: 'Es Parcial', key: 'esParcial', width: 12 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1C9A58' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    pagos.forEach((pago) => {
      worksheet.addRow({
        id: pago.id,
        reservaId: pago.reservaId,
        fechaPago: pago.pagadoEn
          ? new Date(pago.pagadoEn).toLocaleString('es-CL')
          : 'N/A',
        sede: pago.reserva?.cancha?.sede?.nombre || 'N/A',
        cancha: pago.reserva?.cancha
          ? `${pago.reserva.cancha.deporte} ${pago.reserva.cancha.id || ''}`
          : 'N/A',
        jugador: pago.reserva?.jugador?.nombre || 'N/A',
        emailJugador: pago.reserva?.jugador?.email || 'N/A',
        montoTotal: pago.montoTotal,
        estado: this.translatePagoEstado(pago.estado),
        tokenTransbank: pago.tokenTransbank || 'N/A',
        referenciaTransbank: pago.referenciaTransbank || 'N/A',
        esParcial: pago.esParcial ? 'Sí' : 'No',
      });
    });

    worksheet.getColumn('montoTotal').numFmt = '"$" #,##0';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer) as Buffer;
  }

  async getReporteNoShowsExcel(
    params: ReporteNoShowsParams,
    user: any,
  ): Promise<Buffer> {
    this.validateAdminAccess(user);

    const reservasNoShow = await this.reservaRepository.find({
      where: {
        estado: 'no_asistio',
        inicio: Between(params.fechaInicio, params.fechaFin),
        cancha: { sedeId: params.sedeId },
      },
      relations: ['jugador', 'cancha', 'cancha.sede'],
      order: { inicio: 'ASC' },
    });

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('No-Shows');

    worksheet.columns = [
      { header: 'ID Reserva', key: 'id', width: 12 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Hora', key: 'hora', width: 12 },
      { header: 'Sede', key: 'sede', width: 20 },
      { header: 'Cancha', key: 'cancha', width: 15 },
      { header: 'Jugador', key: 'jugador', width: 25 },
      { header: 'Email Jugador', key: 'emailJugador', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Inasistencias 60d', key: 'inasistencias', width: 15 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFC62828' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    reservasNoShow.forEach((reserva) => {
      const inicio = new Date(reserva.inicio);
      worksheet.addRow({
        id: reserva.id,
        fecha: inicio.toLocaleDateString('es-CL'),
        hora: inicio.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        sede: reserva.cancha?.sede?.nombre || 'N/A',
        cancha: `${reserva.cancha?.deporte} ${reserva.cancha?.id || ''}`,
        jugador: reserva.jugador?.nombre || 'N/A',
        emailJugador: reserva.jugador?.email || 'N/A',
        telefono: reserva.jugador?.telefono || 'N/A',
        inasistencias: reserva.jugador?.inasistencias60Dias || 0,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer) as Buffer;
  }

  async getResumenEstadisticas(
    sedeId: number | undefined,
    fechaInicio: Date,
    fechaFin: Date,
    user: any,
  ): Promise<any> {
    this.validateAdminAccess(user);

    const whereClause: any = {
      inicio: Between(fechaInicio, fechaFin),
      estado: In(['pagada', 'retenida']),
    };

    if (sedeId) {
      whereClause.cancha = { sedeId };
    }

    const reservas = await this.reservaRepository.find({
      where: whereClause,
      relations: ['cancha', 'cancha.sede', 'tarifa', 'jugador'],
    });

    const totalReservas = reservas.length;
    const reservasPagadas = reservas.filter(r => r.estado === 'pagada').length;
    const reservasRetenidas = reservas.filter(r => r.estado === 'retenida').length;

    const ingresosTotales = reservas
      .filter(r => r.estado === 'pagada')
      .reduce((acc, r) => acc + Number(r.tarifa?.monto || 0), 0);

    const reservasNoShow = await this.reservaRepository.count({
      where: {
        estado: 'no_asistio',
        inicio: Between(fechaInicio, fechaFin),
        ...(sedeId ? { cancha: { sedeId } } : {}),
      },
    });

    const jugadoresBloqueados = await this.jugadorRepository.count({
      where: { bloqueado: true },
    });

    const reservasPorSede: Record<string, number> = {};
    reservas.forEach(r => {
      const sedeNombre = r.cancha?.sede?.nombre || 'Unknown';
      reservasPorSede[sedeNombre] = (reservasPorSede[sedeNombre] || 0) + 1;
    });

    return {
      periodo: {
        inicio: fechaInicio.toISOString(),
        fin: fechaFin.toISOString(),
      },
      totales: {
        reservasTotales: totalReservas,
        reservasPagadas,
        reservasRetenidas,
        reservasNoShow,
        jugadoresBloqueados,
        ingresosTotales,
      },
      reservasPorSede,
      tasaOcupacion: totalReservas > 0
        ? Math.round((reservasPagadas / totalReservas) * 100)
        : 0,
    };
  }

  private translateEstado(estado: string): string {
    const translations: Record<string, string> = {
      retenida: 'Retenida',
      pagada: 'Pagada',
      cancelada: 'Cancelada',
      asistio: 'Asistió',
      no_asistio: 'No Asistió',
    };
    return translations[estado] || estado;
  }

  private translatePagoEstado(estado: string): string {
    const translations: Record<string, string> = {
      pendiente: 'Pendiente',
      completado: 'Completado',
      fallido: 'Fallido',
      reembolsado: 'Reembolsado',
    };
    return translations[estado] || estado;
  }

  private validateAdminAccess(user: any): void {
    if (user.role !== 'administrador') {
      throw new ForbiddenException('Solo el administrador puede exportar reportes');
    }
  }
}
