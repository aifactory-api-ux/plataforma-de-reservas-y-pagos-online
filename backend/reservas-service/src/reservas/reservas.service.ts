import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, In } from 'typeorm';
import { Reserva, ReservationStatus } from './entities/reserva.entity';
import { BloqueoCancha } from './entities/bloqueo-cancha.entity';
import { Jugador } from './entities/jugador.entity';
import { Cancha } from './entities/cancha.entity';
import { Tarifa } from './entities/tarifa.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { CreateReservaPresencialDto } from './dto/create-reserva-presencial.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { GetDisponibilidadDto } from './dto/get-disponibilidad.dto';
import { isTimeOverlapping, addMinutes, getStartOfDay, getEndOfDay, getFranjaHoraria } from '../../../shared/utils/date.utils';
import { RESERVATION_TIMEOUT_MINUTES, RESERVATION_STATUS, MAX_RESERVAS_FUTURAS } from '../../../shared/constants/reservation-status';

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
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(BloqueoCancha)
    private readonly bloqueoCanchaRepository: Repository<BloqueoCancha>,
    @InjectRepository(Jugador)
    private readonly jugadorRepository: Repository<Jugador>,
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Tarifa)
    private readonly tarifaRepository: Repository<Tarifa>,
    private readonly dataSource: DataSource,
  ) {}

  async createReserva(createReservaDto: CreateReservaDto): Promise<Reserva> {
    const { jugadorId, canchaId, tarifaId, inicio, fin } = createReservaDto;

    const jugador = await this.jugadorRepository.findOne({ where: { id: jugadorId } });
    if (!jugador) {
      throw new NotFoundException('Jugador no encontrado');
    }

    if (jugador.bloqueado) {
      throw new BadRequestException('El jugador se encuentra bloqueado y no puede realizar reservas');
    }

    const existentes = await this.reservaRepository.count({
      where: {
        jugadorId,
        estado: In(['retenida', 'pagada']),
      },
    });

    if (existentes >= MAX_RESERVAS_FUTURAS) {
      throw new BadRequestException(
        `El jugador tiene el máximo de ${MAX_RESERVAS_FUTURAS} reservas futuras permitidas`,
      );
    }

    const ahora = new Date();
    const reservasActivas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.jugadorId = :jugadorId', { jugadorId })
      .andWhere('reserva.estado IN (:...estados)', { estados: ['retenida', 'pagada'] })
      .andWhere('reserva.inicio > :ahora', { ahora })
      .getCount();

    if (reservasActivas >= MAX_RESERVAS_FUTURAS) {
      throw new BadRequestException(
        `El jugador tiene el máximo de ${MAX_RESERVAS_FUTURAS} reservas futuras permitidas`,
      );
    }

    const cancha = await this.canchaRepository.findOne({ where: { id: canchaId } });
    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    if (cancha.estado !== 'disponible') {
      throw new BadRequestException('La cancha no se encuentra disponible');
    }

    const tarifa = await this.tarifaRepository.findOne({ where: { id: tarifaId } });
    if (!tarifa) {
      throw new NotFoundException('Tarifa no encontrada');
    }

    const conflicto = await this.checkConflictoCancha(canchaId, inicio, fin);
    if (conflicto) {
      throw new ConflictException('La cancha ya está reservada para el horario seleccionado');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reserva = queryRunner.manager.create(Reserva, {
        jugadorId,
        canchaId,
        tarifaId,
        inicio,
        fin,
        estado: RESERVATION_STATUS.RETENIDA as ReservationStatus,
      });

      const reservaGuardada = await queryRunner.manager.save(reserva);

      const bloqueoCancha = queryRunner.manager.create(BloqueoCancha, {
        canchaId,
        reservaId: reservaGuardada.id,
        inicio,
        fin,
        estado: 'activo',
      });

      await queryRunner.manager.save(bloqueoCancha);

      await queryRunner.commitTransaction();

      return this.reservaRepository.findOne({
        where: { id: reservaGuardada.id },
        relations: ['jugador', 'cancha', 'tarifa'],
      }) as Promise<Reserva>;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllReservas(): Promise<Reserva[]> {
    return this.reservaRepository.find({
      relations: ['jugador', 'cancha', 'tarifa', 'pago'],
      order: { inicio: 'ASC' },
    });
  }

  async findReservaById(id: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.findOne({
      where: { id },
      relations: ['jugador', 'cancha', 'tarifa', 'pago', 'bloqueo'],
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    return reserva;
  }

  async findReservasByJugador(jugadorId: number): Promise<Reserva[]> {
    return this.reservaRepository.find({
      where: { jugadorId },
      relations: ['cancha', 'tarifa', 'pago'],
      order: { inicio: 'DESC' },
    });
  }

  async findReservasByCancha(canchaId: number, fecha: Date): Promise<Reserva[]> {
    const inicioDelDia = getStartOfDay(fecha);
    const finDelDia = getEndOfDay(fecha);

    return this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.canchaId = :canchaId', { canchaId })
      .andWhere('reserva.inicio >= :inicioDelDia', { inicioDelDia })
      .andWhere('reserva.inicio <= :finDelDia', { finDelDia })
      .andWhere('reserva.estado IN (:...estados)', { estados: ['retenida', 'pagada'] })
      .orderBy('reserva.inicio', 'ASC')
      .getMany();
  }

  async updateReserva(id: number, updateReservaDto: UpdateReservaDto): Promise<Reserva> {
    const reserva = await this.findReservaById(id);

    if (updateReservaDto.estado) {
      reserva.estado = updateReservaDto.estado;

      if (updateReservaDto.estado === RESERVATION_STATUS.PAGADA) {
        reserva.confirmadaEn = new Date();
      }
    }

    if (updateReservaDto.confirmadaEn !== undefined) {
      reserva.confirmadaEn = updateReservaDto.confirmadaEn;
    }

    return this.reservaRepository.save(reserva);
  }

  async cancelarReserva(id: number): Promise<Reserva> {
    const reserva = await this.findReservaById(id);

    if (reserva.estado === 'cancelada') {
      throw new BadRequestException('La reserva ya se encuentra cancelada');
    }

    if (reserva.estado === 'pagada') {
      throw new BadRequestException('No se puede cancelar una reserva pagada directamente. Contacte al administrador.');
    }

    reserva.estado = RESERVATION_STATUS.CANCELADA as ReservationStatus;

    await this.bloqueoCanchaRepository.update(
      { reservaId: id, estado: 'activo' },
      { estado: 'liberado' },
    );

    return this.reservaRepository.save(reserva);
  }

  async getDisponibilidad(getDisponibilidadDto: GetDisponibilidadDto): Promise<DisponibilidadResponse> {
    const { sedeId, deporte, fecha, franja } = getDisponibilidadDto;

    const query = this.canchaRepository.createQueryBuilder('cancha');

    if (sedeId) {
      query.andWhere('cancha.sedeId = :sedeId', { sedeId });
    }

    if (deporte) {
      query.andWhere('cancha.deporte = :deporte', { deporte });
    }

    if (franja) {
      query.andWhere('cancha.estado = :estado', { estado: 'disponible' });
    }

    const canchas = await query.getMany();

    const inicioDelDia = getStartOfDay(fecha);
    const finDelDia = getEndOfDay(fecha);

    const franjaHoraria = franja || getFranjaHoraria(fecha.getHours());

    const tarifas = await this.tarifaRepository.find({
      where: {
        deporte: deporte as 'padel' | 'futbol7' || 'padel',
        franja: franjaHoraria,
      },
    });

    const slots: AvailabilitySlot[] = [];

    for (const cancha of canchas) {
      if (cancha.estado !== 'disponible') continue;

      const reservas = await this.findReservasByCancha(cancha.id, fecha);

      const inicioHora = franjaHoraria === 'manana' ? 6 : franjaHoraria === 'tarde' ? 12 : 20;
      const finHora = franjaHoraria === 'manana' ? 12 : franjaHoraria === 'tarde' ? 20 : 23;

      for (let hora = inicioHora; hora < finHora; hora++) {
        for (const tarifa of tarifas) {
          const slotInicio = new Date(fecha);
          slotInicio.setHours(hora, 0, 0, 0);

          const slotFin = addMinutes(slotInicio, tarifa.duracionMinutos);

          if (slotFin.getHours() > finHora) continue;

          const hayConflicto = reservas.some((reserva) =>
            isTimeOverlapping(slotInicio, slotFin, reserva.inicio, reserva.fin),
          );

          const bloqueosActivos = await this.bloqueoCanchaRepository.find({
            where: {
              canchaId: cancha.id,
              estado: 'activo',
            },
          });

          const hayBloqueo = bloqueosActivos.some((bloqueo) =>
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
            disponible: !hayConflicto && !hayBloqueo,
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

  async checkConflictoCancha(canchaId: number, inicio: Date, fin: Date): Promise<boolean> {
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
      return true;
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

    return !!bloqueosConflicto;
  }

  async checkSlotDisponibilidad(canchaId: number, inicio: Date, fin: Date): Promise<{ disponible: boolean }> {
    const conflicto = await this.checkConflictoCancha(canchaId, inicio, fin);
    return { disponible: !conflicto };
  }

  async liberarReservaExpirada(reservaId: number): Promise<void> {
    const reserva = await this.reservaRepository.findOne({
      where: { id: reservaId },
    });

    if (!reserva || reserva.estado !== 'retenida') {
      return;
    }

    const ahora = new Date();
    const tiempoRetencion = addMinutes(reserva.creadaEn, RESERVATION_TIMEOUT_MINUTES);

    if (ahora >= tiempoRetencion) {
      await this.reservaRepository.update(reservaId, {
        estado: 'cancelada' as ReservationStatus,
      });

      await this.bloqueoCanchaRepository.update(
        { reservaId, estado: 'activo' },
        { estado: 'liberado' },
      );
    }
  }

  async marcarAsistencia(id: number, asistio: boolean): Promise<Reserva> {
    const reserva = await this.findReservaById(id);

    if (reserva.estado !== 'pagada') {
      throw new BadRequestException('Solo se puede marcar asistencia de reservas pagadas');
    }

    reserva.estado = asistio
      ? (RESERVATION_STATUS.ASISTIO as ReservationStatus)
      : (RESERVATION_STATUS.NO_ASISTIO as ReservationStatus);

    const jugador = await this.jugadorRepository.findOne({ where: { id: reserva.jugadorId } });

    if (jugador && !asistio) {
      jugador.inasistencias60Dias += 1;

      if (jugador.inasistencias60Dias >= 3) {
        jugador.bloqueado = true;
      }

      await this.jugadorRepository.save(jugador);
    }

    return this.reservaRepository.save(reserva);
  }

  async createReservaPresencial(createReservaPresencialDto: CreateReservaPresencialDto): Promise<Reserva> {
    const {
      jugadorNombre,
      jugadorTelefono,
      jugadorEmail,
      canchaId,
      tarifaId,
      inicio,
      fin,
      esPagoManual,
    } = createReservaPresencialDto;

    let jugador = await this.jugadorRepository.findOne({
      where: { telefono: jugadorTelefono },
    });

    if (!jugador) {
      jugador = this.jugadorRepository.create({
        nombre: jugadorNombre,
        telefono: jugadorTelefono,
        email: jugadorEmail || `${jugadorTelefono}@presencial.local`,
        bloqueado: false,
        inasistencias60Dias: 0,
      });
      jugador = await this.jugadorRepository.save(jugador);
    }

    if (jugador.bloqueado) {
      throw new BadRequestException('El jugador se encuentra bloqueado y no puede realizar reservas');
    }

    const cancha = await this.canchaRepository.findOne({ where: { id: canchaId } });
    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    if (cancha.estado !== 'disponible') {
      throw new BadRequestException('La cancha no se encuentra disponible');
    }

    const tarifa = await this.tarifaRepository.findOne({ where: { id: tarifaId } });
    if (!tarifa) {
      throw new NotFoundException('Tarifa no encontrada');
    }

    const inicioDate = new Date(inicio);
    const finDate = new Date(fin);

    const conflicto = await this.checkConflictoCancha(canchaId, inicioDate, finDate);
    if (conflicto) {
      throw new ConflictException('La cancha ya está reservada para el horario seleccionado');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let estadoReserva: ReservationStatus;
      let confirmadaEn: Date | null = null;

      if (esPagoManual) {
        estadoReserva = 'pagada';
        confirmadaEn = new Date();
      } else {
        estadoReserva = 'pagada';
        confirmadaEn = new Date();
      }

      const reserva = queryRunner.manager.create(Reserva, {
        jugadorId: jugador.id,
        canchaId,
        tarifaId,
        inicio: inicioDate,
        fin: finDate,
        estado: estadoReserva,
        confirmadaEn,
      });

      const reservaGuardada = await queryRunner.manager.save(reserva);

      const bloqueoCancha = queryRunner.manager.create(BloqueoCancha, {
        canchaId,
        reservaId: reservaGuardada.id,
        inicio: inicioDate,
        fin: finDate,
        estado: 'activo',
      });
      await queryRunner.manager.save(bloqueoCancha);

      await queryRunner.commitTransaction();

      return this.reservaRepository.findOne({
        where: { id: reservaGuardada.id },
        relations: ['jugador', 'cancha', 'tarifa'],
      }) as Promise<Reserva>;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}