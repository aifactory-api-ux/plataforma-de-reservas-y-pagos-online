import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Not, IsNull } from 'typeorm';
import { Reserva } from './entities/reserva.entity';
import { BloqueoCancha } from './entities/bloqueo-cancha.entity';
import { Cancha } from './entities/cancha.entity';
import { Clase } from './entities/clase.entity';

export interface AgendaRow {
  hora: string;
  canchaId: number;
  reservaId: number | null;
  estado: string | null;
  jugadorNombre: string | null;
  deporte: string | null;
  tipo: 'reserva' | 'bloqueo' | 'clase' | 'disponible';
  bloqueoMotivo?: string;
  claseNombre?: string;
  profesorNombre?: string;
}

export interface AgendaGridResponse {
  fecha: string;
  sedeId: number;
  canchas: Array<{
    id: number;
    nombre: string;
    deporte: string;
    techada: boolean;
    estado: string;
    slots: AgendaRow[];
  }>;
  franjaHoraria: {
    inicio: string;
    fin: string;
  };
}

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(BloqueoCancha)
    private readonly bloqueoCanchaRepository: Repository<BloqueoCancha>,
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,
  ) {}

  async getAgendaDiaria(
    sedeId: number,
    fecha: Date,
    franja: 'manana' | 'tarde' | 'noche' | 'completa' = 'completa',
  ): Promise<AgendaGridResponse> {
    const fechaInicio = this.obtenerFechaInicio(fecha, franja);
    const fechaFin = this.obtenerFechaFin(fecha, franja);

    const canchas = await this.canchaRepository.find({
      where: { sedeId },
      order: { id: 'ASC' },
    });

    const reservas = await this.reservaRepository.find({
      where: {
        cancha: { sedeId },
        inicio: Between(fechaInicio, fechaFin),
      },
      relations: ['jugador', 'cancha', 'tarifa'],
    });

    const bloqueos = await this.bloqueoCanchaRepository.find({
      where: {
        cancha: { sedeId },
        inicio: Between(fechaInicio, fechaFin),
        estado: 'activo',
      },
      relations: ['cancha'],
    });

    const clases = await this.claseRepository.find({
      where: {
        cancha: { sedeId },
        inicio: Between(fechaInicio, fechaFin),
      },
      relations: ['profesor', 'cancha'],
    });

    const horarios = this.generarHorarios(franja);
    const gridCanchas = canchas.map(cancha => {
      const slots = horarios.map(hora => {
        const horaDate = this.parseHora(hora, fecha);
        const slotFin = new Date(horaDate.getTime() + 60 * 60 * 1000);

        const reserva = reservas.find(r =>
          r.canchaId === cancha.id &&
          this.seSuperpone(r.inicio, r.fin, horaDate, slotFin),
        );

        const bloqueo = bloqueos.find(b =>
          b.canchaId === cancha.id &&
          this.seSuperpone(b.inicio, b.fin, horaDate, slotFin),
        );

        const clase = clases.find(c =>
          c.canchaId === cancha.id &&
          this.seSuperpone(c.inicio, c.fin, horaDate, slotFin),
        );

        return this.construirSlot(hora, cancha, reserva, bloqueo, clase);
      });

      return {
        id: cancha.id,
        nombre: `${cancha.deporte === 'padel' ? 'Pádel' : 'Fútbol 7'} ${cancha.id}`,
        deporte: cancha.deporte,
        techada: cancha.techada,
        estado: cancha.estado,
        slots,
      };
    });

    return {
      fecha: fecha.toISOString().split('T')[0],
      sedeId,
      canchas: gridCanchas,
      franjaHoraria: this.getFranjaHoraria(franja),
    };
  }

  private obtenerFechaInicio(fecha: Date, franja: string): Date {
    const date = new Date(fecha);
    date.setHours(0, 0, 0, 0);
    switch (franja) {
      case 'manana':
        date.setHours(8, 0, 0, 0);
        break;
      case 'tarde':
        date.setHours(14, 0, 0, 0);
        break;
      case 'noche':
        date.setHours(19, 0, 0, 0);
        break;
      default:
        date.setHours(8, 0, 0, 0);
    }
    return date;
  }

  private obtenerFechaFin(fecha: Date, franja: string): Date {
    const date = new Date(fecha);
    date.setHours(23, 59, 59, 999);
    switch (franja) {
      case 'manana':
        date.setHours(13, 59, 59, 999);
        break;
      case 'tarde':
        date.setHours(18, 59, 59, 999);
        break;
      case 'noche':
        date.setHours(22, 59, 59, 999);
        break;
    }
    return date;
  }

  private generarHorarios(franja: string): string[] {
    const horarios: string[] = [];
    let horaInicio = 8;
    let horaFin = 22;

    switch (franja) {
      case 'manana':
        horaInicio = 8;
        horaFin = 13;
        break;
      case 'tarde':
        horaInicio = 14;
        horaFin = 18;
        break;
      case 'noche':
        horaInicio = 19;
        horaFin = 22;
        break;
    }

    for (let h = horaInicio; h < horaFin; h++) {
      horarios.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return horarios;
  }

  private getFranjaHoraria(franja: string): { inicio: string; fin: string } {
    switch (franja) {
      case 'manana':
        return { inicio: '08:00', fin: '14:00' };
      case 'tarde':
        return { inicio: '14:00', fin: '19:00' };
      case 'noche':
        return { inicio: '19:00', fin: '23:00' };
      default:
        return { inicio: '08:00', fin: '23:00' };
    }
  }

  private seSuperpone(inicio1: Date, fin1: Date, inicio2: Date, fin2: Date): boolean {
    return inicio1 < fin2 && fin1 > inicio2;
  }

  private parseHora(hora: string, fecha: Date): Date {
    const [h, m] = hora.split(':').map(Number);
    const date = new Date(fecha);
    date.setHours(h, m, 0, 0);
    return date;
  }

  private construirSlot(
    hora: string,
    cancha: Cancha,
    reserva: Reserva | undefined,
    bloqueo: BloqueoCancha | undefined,
    clase: Clase | undefined,
  ): AgendaRow {
    if (reserva) {
      return {
        hora,
        canchaId: cancha.id,
        reservaId: reserva.id,
        estado: reserva.estado,
        jugadorNombre: reserva.jugador?.nombre || null,
        deporte: cancha.deporte,
        tipo: 'reserva',
      };
    }

    if (clase) {
      return {
        hora,
        canchaId: cancha.id,
        reservaId: null,
        estado: 'clase',
        jugadorNombre: clase.profesor?.nombre || null,
        deporte: cancha.deporte,
        tipo: 'clase',
        claseNombre: clase.nombre,
        profesorNombre: clase.profesor?.nombre,
      };
    }

    if (bloqueo) {
      return {
        hora,
        canchaId: cancha.id,
        reservaId: null,
        estado: 'bloqueado',
        jugadorNombre: null,
        deporte: cancha.deporte,
        tipo: 'bloqueo',
        bloqueoMotivo: 'Bloqueado por mantenimiento',
      };
    }

    return {
      hora,
      canchaId: cancha.id,
      reservaId: null,
      estado: null,
      jugadorNombre: null,
      deporte: cancha.deporte,
      tipo: 'disponible',
    };
  }

  async getResumenOcupacion(sedeId: number, fecha: Date): Promise<any> {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const canchas = await this.canchaRepository.find({ where: { sedeId } });

    const reservas = await this.reservaRepository.find({
      where: {
        cancha: { sedeId },
        inicio: Between(fechaInicio, fechaFin),
        estado: In(['pagada', 'retenida']),
      },
      relations: ['cancha', 'tarifa'],
    });

    const totalHoras = canchas.length * 14;
    const horasOcupadas = reservas.reduce((acc, r) => {
      const inicio = new Date(r.inicio).getTime();
      const fin = new Date(r.fin).getTime();
      return acc + (fin - inicio) / (1000 * 60 * 60);
    }, 0);

    return {
      fecha: fecha.toISOString().split('T')[0],
      sedeId,
      totalCanchas: canchas.length,
      reservasTotales: reservas.length,
      porcentajeOcupacion: Math.round((horasOcupadas / totalHoras) * 100),
      ingresosEstimados: reservas
        .filter(r => r.estado === 'pagada')
        .reduce((acc, r) => acc + Number(r.tarifa?.monto || 0), 0),
      reservasPorEstado: {
        pagada: reservas.filter(r => r.estado === 'pagada').length,
        retenida: reservas.filter(r => r.estado === 'retenida').length,
      },
    };
  }
}
