import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Not } from 'typeorm';
import { Jugador } from './entities/jugador.entity';
import { UsuarioPersonal } from './entities/usuario-personal.entity';
import { ConsentimientoDatos } from '../consentimiento/consentimiento-datos.entity';

const CONSENT_VERSION = '1.0';
const BLOQUEO_DIAS = 30;
const INASISTENCIAS_MAX = 3;
const INASISTENCIAS_VENTANA_DIAS = 60;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Jugador)
    private jugadorRepository: Repository<Jugador>,
    @InjectRepository(UsuarioPersonal)
    private usuarioPersonalRepository: Repository<UsuarioPersonal>,
    @InjectRepository(ConsentimientoDatos)
    private consentimientoRepository: Repository<ConsentimientoDatos>,
  ) {}

  async findJugadorById(id: number): Promise<Jugador> {
    const jugador = await this.jugadorRepository.findOne({
      where: { id },
      relations: ['consentimientos'],
    });
    if (!jugador) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return jugador;
  }

  async findJugadorByEmail(email: string): Promise<Jugador | null> {
    return this.jugadorRepository.findOne({
      where: { email },
      relations: ['consentimientos'],
    });
  }

  async updateJugadorProfile(
    id: number,
    data: { nombre?: string; telefono?: string },
  ): Promise<Jugador> {
    const jugador = await this.findJugadorById(id);

    if (data.nombre) {
      jugador.nombre = data.nombre;
    }
    if (data.telefono) {
      jugador.telefono = data.telefono;
    }

    return this.jugadorRepository.save(jugador);
  }

  async bloquearJugador(jugadorId: number, motivo: string): Promise<Jugador> {
    const jugador = await this.findJugadorById(jugadorId);
    jugador.bloqueado = true;
    return this.jugadorRepository.save(jugador);
  }

  async desbloquearJugador(jugadorId: number): Promise<Jugador> {
    const jugador = await this.findJugadorById(jugadorId);
    jugador.bloqueado = false;
    return this.jugadorRepository.save(jugador);
  }

  async incrementInasistencias(jugadorId: number): Promise<{ bloqueado: boolean }> {
    const jugador = await this.findJugadorById(jugadorId);

    jugador.inasistencias60Dias += 1;

    if (jugador.inasistencias60Dias >= INASISTENCIAS_MAX) {
      jugador.bloqueado = true;
      await this.jugadorRepository.save(jugador);
      return { bloqueado: true };
    }

    await this.jugadorRepository.save(jugador);
    return { bloqueado: false };
  }

  async limpiarInasistenciasVencidas(): Promise<void> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - INASISTENCIAS_VENTANA_DIAS);

    await this.jugadorRepository.update(
      {
        inasistencias60Dias: Not(0),
      },
      {
        inasistencias60Dias: 0,
      },
    );
  }

  async checkJugadorBloqueado(jugadorId: number): Promise<boolean> {
    const jugador = await this.findJugadorById(jugadorId);
    return jugador.bloqueado;
  }

  async findUsuarioPersonalById(id: number): Promise<UsuarioPersonal> {
    const usuario = await this.usuarioPersonalRepository.findOne({
      where: { id },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario de staff no encontrado');
    }
    return usuario;
  }

  async findUsuarioPersonalByEmail(email: string): Promise<UsuarioPersonal | null> {
    return this.usuarioPersonalRepository.findOne({
      where: { email },
    });
  }

  async updateUsuarioPersonal(
    id: number,
    data: { nombre?: string; email?: string },
  ): Promise<UsuarioPersonal> {
    const usuario = await this.findUsuarioPersonalById(id);

    if (data.nombre) {
      usuario.nombre = data.nombre;
    }
    if (data.email) {
      const existing = await this.findUsuarioPersonalByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new BadRequestException('El email ya está en uso');
      }
      usuario.email = data.email;
    }

    return this.usuarioPersonalRepository.save(usuario);
  }

  async deactivateUsuarioPersonal(id: number): Promise<UsuarioPersonal> {
    const usuario = await this.findUsuarioPersonalById(id);
    usuario.activo = false;
    return this.usuarioPersonalRepository.save(usuario);
  }

  async activateUsuarioPersonal(id: number): Promise<UsuarioPersonal> {
    const usuario = await this.findUsuarioPersonalById(id);
    usuario.activo = true;
    return this.usuarioPersonalRepository.save(usuario);
  }

  async getConsentimiento(jugadorId: number, version: string): Promise<ConsentimientoDatos | null> {
    return this.consentimientoRepository.findOne({
      where: { jugadorId, version },
    });
  }

  async hasConsentAceptado(jugadorId: number): Promise<boolean> {
    const consentimiento = await this.consentimientoRepository.findOne({
      where: {
        jugadorId,
        version: CONSENT_VERSION,
        aceptado: true,
      },
    });
    return !!consentimiento;
  }

  async registrarConsentimiento(
    jugadorId: number,
    version: string = CONSENT_VERSION,
  ): Promise<ConsentimientoDatos> {
    const existing = await this.getConsentimiento(jugadorId, version);

    if (existing) {
      existing.aceptado = true;
      existing.fechaConsentimiento = new Date();
      return this.consentimientoRepository.save(existing);
    }

    const consentimiento = this.consentimientoRepository.create({
      jugadorId,
      version,
      fechaConsentimiento: new Date(),
      aceptado: true,
    });
    return this.consentimientoRepository.save(consentimiento);
  }

  async findJugadoresConReservasEnSede(sedeId: number): Promise<Jugador[]> {
    const jugadores = await this.jugadorRepository
      .createQueryBuilder('jugador')
      .innerJoin('jugador.reservas', 'reserva')
      .innerJoin('reserva.cancha', 'cancha')
      .where('cancha.sedeId = :sedeId', { sedeId })
      .andWhere('jugador.bloqueado = :bloqueado', { bloqueado: false })
      .distinct()
      .getMany();

    return jugadores;
  }

  async getJugadorStats(jugadorId: number): Promise<{
    totalReservas: number;
    reservasActivas: number;
    inasistencias60Dias: number;
    bloqueado: boolean;
  }> {
    const jugador = await this.findJugadorById(jugadorId);

    const totalReservas = await this.jugadorRepository.count({
      where: { id: jugadorId },
      relations: ['reservas'],
    });

    const reservasActivas = await this.jugadorRepository
      .createQueryBuilder('jugador')
      .innerJoin('jugador.reservas', 'reserva')
      .where('jugador.id = :jugadorId', { jugadorId })
      .andWhere('reserva.estado IN (:...estados)', {
        estados: ['retenida', 'pagada'],
      })
      .getCount();

    return {
      totalReservas,
      reservasActivas,
      inasistencias60Dias: jugador.inasistencias60Dias,
      bloqueado: jugador.bloqueado,
    };
  }
}
