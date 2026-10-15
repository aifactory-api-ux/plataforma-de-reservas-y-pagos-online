import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { Sede } from './entities/sede.entity';
import { Cancha } from './entities/cancha.entity';
import { Tarifa } from './entities/tarifa.entity';
import { Reserva } from './entities/reserva.entity';
import { BloqueoCancha } from './entities/bloqueo-cancha.entity';
import { UsuarioPersonal } from './entities/usuario-personal.entity';

@Injectable()
export class SedesService {
  constructor(
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Tarifa)
    private readonly tarifaRepository: Repository<Tarifa>,
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(BloqueoCancha)
    private readonly bloqueoCanchaRepository: Repository<BloqueoCancha>,
    @InjectRepository(UsuarioPersonal)
    private readonly usuarioPersonalRepository: Repository<UsuarioPersonal>,
  ) {}

  async findAllSedes(): Promise<Sede[]> {
    return this.sedeRepository.find({
      relations: ['canchas'],
      order: { id: 'ASC' },
    });
  }

  async findSedeById(id: number): Promise<Sede> {
    const sede = await this.sedeRepository.findOne({
      where: { id },
      relations: ['canchas', 'usuarios'],
    });
    if (!sede) {
      throw new NotFoundException(`Sede con id ${id} no encontrada`);
    }
    return sede;
  }

  async findCanchasBySede(sedeId: number): Promise<Cancha[]> {
    return this.canchaRepository.find({
      where: { sedeId },
      order: { id: 'ASC' },
    });
  }

  async findCanchaById(id: number): Promise<Cancha> {
    const cancha = await this.canchaRepository.findOne({
      where: { id },
      relations: ['sede'],
    });
    if (!cancha) {
      throw new NotFoundException(`Cancha con id ${id} no encontrada`);
    }
    return cancha;
  }

  async findTarifasByDeporte(deporte: 'padel' | 'futbol7'): Promise<Tarifa[]> {
    return this.tarifaRepository.find({
      where: { deporte },
      order: { franja: 'ASC', duracionMinutos: 'ASC' },
    });
  }

  async getTarifas(): Promise<Tarifa[]> {
    return this.tarifaRepository.find({
      order: { deporte: 'ASC', franja: 'ASC', duracionMinutos: 'ASC' },
    });
  }

  async getEstadisticasOcupacion(
    sedeId: number,
    fechaInicio: Date,
    fechaFin: Date,
    userId: number,
    userRole: string,
    userSedeId: number,
  ): Promise<any> {
    if (userRole !== 'administrador' && userSedeId !== sedeId) {
      throw new ForbiddenException('No tienes acceso a esta sede');
    }

    const reservas = await this.reservaRepository.find({
      where: {
        cancha: {
          sedeId,
        },
        inicio: Between(fechaInicio, fechaFin),
        estado: In(['pagada', 'retenida']),
      },
      relations: ['cancha', 'tarifa'],
    });

    const canchas = await this.canchaRepository.find({
      where: { sedeId },
    });

    const totalCanchas = canchas.length;
    const horasDisponibles = this.calcularHorasDisponibles(fechaInicio, fechaFin, totalCanchas);
    const horasOcupadas = reservas.reduce((acc, r) => {
      const inicio = new Date(r.inicio).getTime();
      const fin = new Date(r.fin).getTime();
      return acc + (fin - inicio) / (1000 * 60 * 60);
    }, 0);

    const porcentajeOcupacion = horasDisponibles > 0
      ? Math.round((horasOcupadas / horasDisponibles) * 100)
      : 0;

    const ingresosTotales = reservas
      .filter(r => r.estado === 'pagada')
      .reduce((acc, r) => acc + Number(r.tarifa?.monto || 0), 0);

    const reservasPorDeporte = canchas.reduce((acc, cancha) => {
      const count = reservas.filter(r => r.canchaId === cancha.id).length;
      acc[cancha.deporte] = (acc[cancha.deporte] || 0) + count;
      return acc;
    }, {} as Record<string, number>);

    return {
      sedeId,
      periodo: {
        inicio: fechaInicio.toISOString(),
        fin: fechaFin.toISOString(),
      },
      totalReservas: reservas.length,
      reservasPorDeporte,
      porcentajeOcupacion,
      horasDisponibles,
      horasOcupadas,
      ingresosTotales,
      detallePorCancha: canchas.map(cancha => {
        const reservasCancha = reservas.filter(r => r.canchaId === cancha.id);
        return {
          canchaId: cancha.id,
          nombre: `${cancha.deporte === 'padel' ? 'Pádel' : 'Fútbol 7'} ${cancha.id}`,
          reservasCount: reservasCancha.length,
        };
      }),
    };
  }

  private calcularHorasDisponibles(fechaInicio: Date, fechaFin: Date, totalCanchas: number): number {
    const dias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const horasPorDia = 14;
    return dias * horasPorDia * totalCanchas;
  }

  async validarAccesoSede(sedeId: number, userId: number, userRole: string, userSedeId: number): Promise<boolean> {
    if (userRole === 'administrador') {
      return true;
    }
    return userSedeId === sedeId;
  }

  async findSedesByUsuarioPersonal(userId: number): Promise<Sede[]> {
    const usuario = await this.usuarioPersonalRepository.findOne({
      where: { id: userId },
      relations: ['sede'],
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (usuario.rol === 'administrador') {
      return this.sedeRepository.find();
    }
    return [usuario.sede];
  }
}
