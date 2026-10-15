import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Cancha } from '../球场/cancha.entity';
import { Tarifa, TarifaFranja } from '../球场/tarifas.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { BloqueoCancha } from '../reservas/entities/bloqueo-cancha.entity';
import { isTimeOverlapping, getStartOfDay, getEndOfDay, getFranjaHoraria, addMinutes } from '../../../shared/utils/date.utils';

export interface AvailabilitySlot {
  canchaId: number;
  canchaNombre: string;
  deporte: string;
  techada: boolean;
  inicio: Date;
  fin: Date;
  tarifaId: number;
  monto: number;
  disponible: boolean;
}

export interface DisponibilidadResponse {
  fecha: string;
  franja: string;
  slots: AvailabilitySlot[];
}

@Injectable()
export class DisponibilidadService {
  constructor(
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Tarifa)
    private readonly tarifaRepository: Repository<Tarifa>,
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(BloqueoCancha)
    private readonly bloqueoCanchaRepository: Repository<BloqueoCancha>,
  ) {}

  async getDisponibilidad(
    sedeId: number,
    deporte: 'padel' | 'futbol7',
    fecha: Date,
    franja?: TarifaFranja,
  ): Promise<DisponibilidadResponse> {
    const franjaHoraria = franja || getFranjaHoraria(fecha.getHours());

    const query = this.canchaRepository.createQueryBuilder('cancha');

    if (sedeId) {
      query.andWhere('cancha.sedeId = :sedeId', { sedeId });
    }

    if (deporte) {
      query.andWhere('cancha.deporte = :deporte', { deporte });
    }

    query.andWhere('cancha.estado = :estado', { estado: 'disponible' });

    const canchas = await query.getMany();

    const inicioDelDia = getStartOfDay(fecha);
    const finDelDia = getEndOfDay(fecha);

    const tarifas = await this.tarifaRepository.find({
      where: {
        deporte,
        franja: franjaHoraria,
      },
    });

    const slots: AvailabilitySlot[] = [];

    for (const cancha of canchas) {
      const reservas = await this.reservaRepository
        .createQueryBuilder('reserva')
        .where('reserva.canchaId = :canchaId', { canchaId: cancha.id })
        .andWhere('reserva.inicio >= :inicioDelDia', { inicioDelDia })
        .andWhere('reserva.inicio <= :finDelDia', { finDelDia })
        .andWhere('reserva.estado IN (:...estados)', { estados: ['retenida', 'pagada'] })
        .getMany();

      const bloqueosActivos = await this.bloqueoCanchaRepository
        .createQueryBuilder('bloqueo')
        .where('bloqueo.canchaId = :canchaId', { canchaId: cancha.id })
        .andWhere('bloqueo.estado = :estado', { estado: 'activo' })
        .andWhere('bloqueo.inicio >= :inicioDelDia', { inicioDelDia })
        .andWhere('bloqueo.inicio <= :finDelDia', { finDelDia })
        .getMany();

      const inicioHora = franjaHoraria === 'manana' ? 6 : franjaHoraria === 'tarde' ? 12 : 20;
      const finHora = franjaHoraria === 'manana' ? 12 : franjaHoraria === 'tarde' ? 20 : 23;

      for (let hora = inicioHora; hora < finHora; hora++) {
        for (const tarifa of tarifas) {
          const slotInicio = new Date(fecha);
          slotInicio.setHours(hora, 0, 0, 0);

          const slotFin = addMinutes(slotInicio, tarifa.duracionMinutos);

          if (slotFin.getHours() > finHora) continue;

          const hayConflictoReserva = reservas.some((reserva) =>
            isTimeOverlapping(slotInicio, slotFin, reserva.inicio, reserva.fin),
          );

          const hayConflictoBloqueo = bloqueosActivos.some((bloqueo) =>
            isTimeOverlapping(slotInicio, slotFin, bloqueo.inicio, bloqueo.fin),
          );

          slots.push({
            canchaId: cancha.id,
            canchaNombre: `Cancha ${cancha.id}`,
            deporte: cancha.deporte,
            techada: cancha.techada,
            inicio: slotInicio,
            fin: slotFin,
            tarifaId: tarifa.id,
            monto: Number(tarifa.monto),
            disponible: !hayConflictoReserva && !hayConflictoBloqueo,
          });
        }
      }
    }

    return {
      fecha: fecha.toISOString(),
      franja: franjaHoraria,
      slots,
    };
  }

  async checkSlotAvailable(
    canchaId: number,
    inicio: Date,
    fin: Date,
  ): Promise<boolean> {
    const reservasConflicto = await this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.canchaId = :canchaId', { canchaId })
      .andWhere('reserva.estado IN (:...estados)', { estados: ['retenida', 'pagada'] })
      .andWhere(
        '(reserva.inicio < :fin AND reserva.fin > :inicio)',
        { inicio, fin },
      )
      .getOne();

    if (reservasConflicto) {
      return false;
    }

    const bloqueosConflicto = await this.bloqueoCanchaRepository
      .createQueryBuilder('bloqueo')
      .where('bloqueo.canchaId = :canchaId', { canchaId })
      .andWhere('bloqueo.estado = :estado', { estado: 'activo' })
      .andWhere(
        '(bloqueo.inicio < :fin AND bloqueo.fin > :inicio)',
        { inicio, fin },
      )
      .getOne();

    return !bloqueosConflicto;
  }

  async getCanchasDisponiblesPorSede(
    sedeId: number,
    deporte?: 'padel' | 'futbol7',
  ): Promise<Cancha[]> {
    const query = this.canchaRepository.createQueryBuilder('cancha');

    query.andWhere('cancha.sedeId = :sedeId', { sedeId });
    query.andWhere('cancha.estado = :estado', { estado: 'disponible' });

    if (deporte) {
      query.andWhere('cancha.deporte = :deporte', { deporte });
    }

    return query.getMany();
  }
}