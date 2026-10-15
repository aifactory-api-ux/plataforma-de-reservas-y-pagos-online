import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsuarioPersonal, UserRole } from './entities/usuario-personal.entity';
import { Tarifa, TarifaDeporte, TarifaFranja } from './entities/tarifa.entity';
import { BloqueoJugador } from './entities/bloqueo-jugador.entity';
import { Jugador } from './entities/jugador.entity';
import { isValidEmail, isValidNombre } from './validation.utils';

export interface CreateUsuarioDto {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  sedeId: number;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: UserRole;
  activo?: boolean;
}

export interface CreateTarifaDto {
  deporte: TarifaDeporte;
  duracionMinutos: number;
  franja: TarifaFranja;
  monto: number;
}

export interface UpdateTarifaDto {
  monto?: number;
}

export interface CreateBloqueoJugadorDto {
  jugadorId: number;
  motivo: string;
  inicio: Date;
  fin: Date;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UsuarioPersonal)
    private usuarioPersonalRepository: Repository<UsuarioPersonal>,
    @InjectRepository(Tarifa)
    private tarifaRepository: Repository<Tarifa>,
    @InjectRepository(BloqueoJugador)
    private bloqueoJugadorRepository: Repository<BloqueoJugador>,
    @InjectRepository(Jugador)
    private jugadorRepository: Repository<Jugador>,
  ) {}

  async getUsuarios(user: any): Promise<UsuarioPersonal[]> {
    this.validateAdminAccess(user);
    return this.usuarioPersonalRepository.find({
      relations: ['sede'],
      order: { nombre: 'ASC' },
    });
  }

  async getUsuarioById(id: number, user: any): Promise<UsuarioPersonal> {
    this.validateAdminAccess(user);
    const usuario = await this.usuarioPersonalRepository.findOne({
      where: { id },
      relations: ['sede'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return usuario;
  }

  async createUsuario(dto: CreateUsuarioDto, user: any): Promise<UsuarioPersonal> {
    this.validateAdminAccess(user);

    if (!isValidNombre(dto.nombre)) {
      throw new BadRequestException('Nombre inválido');
    }
    if (!isValidEmail(dto.email)) {
      throw new BadRequestException('Email inválido');
    }
    if (!dto.password || dto.password.length < 8) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }

    const existing = await this.usuarioPersonalRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const usuario = this.usuarioPersonalRepository.create({
      nombre: dto.nombre,
      email: dto.email,
      passwordHash: hashedPassword,
      rol: dto.rol,
      sedeId: dto.sedeId,
      activo: true,
    });

    return this.usuarioPersonalRepository.save(usuario);
  }

  async updateUsuario(id: number, dto: UpdateUsuarioDto, user: any): Promise<UsuarioPersonal> {
    this.validateAdminAccess(user);

    const usuario = await this.usuarioPersonalRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    if (dto.nombre !== undefined) {
      if (!isValidNombre(dto.nombre)) {
        throw new BadRequestException('Nombre inválido');
      }
      usuario.nombre = dto.nombre;
    }

    if (dto.email !== undefined) {
      if (!isValidEmail(dto.email)) {
        throw new BadRequestException('Email inválido');
      }
      const existing = await this.usuarioPersonalRepository.findOne({
        where: { email: dto.email },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('El email ya está registrado');
      }
      usuario.email = dto.email;
    }

    if (dto.password !== undefined) {
      if (dto.password.length < 8) {
        throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
      }
      usuario.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (dto.rol !== undefined) {
      usuario.rol = dto.rol;
    }

    if (dto.activo !== undefined) {
      usuario.activo = dto.activo;
    }

    return this.usuarioPersonalRepository.save(usuario);
  }

  async deleteUsuario(id: number, user: any): Promise<void> {
    this.validateAdminAccess(user);

    const usuario = await this.usuarioPersonalRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    if (usuario.rol === 'administrador') {
      throw new ForbiddenException('No se puede eliminar un usuario administrador');
    }

    usuario.activo = false;
    await this.usuarioPersonalRepository.save(usuario);
  }

  async getTarifas(user: any, deporte?: TarifaDeporte): Promise<Tarifa[]> {
    this.validateAdminAccess(user);

    if (deporte) {
      return this.tarifaRepository.find({
        where: { deporte },
        order: { franja: 'ASC', duracionMinutos: 'ASC' },
      });
    }

    return this.tarifaRepository.find({
      order: { deporte: 'ASC', franja: 'ASC', duracionMinutos: 'ASC' },
    });
  }

  async getTarifaById(id: number, user: any): Promise<Tarifa> {
    this.validateAdminAccess(user);
    const tarifa = await this.tarifaRepository.findOne({ where: { id } });
    if (!tarifa) {
      throw new NotFoundException(`Tarifa con id ${id} no encontrada`);
    }
    return tarifa;
  }

  async createTarifa(dto: CreateTarifaDto, user: any): Promise<Tarifa> {
    this.validateAdminAccess(user);

    const validDuraciones = [30, 60, 90, 120, 180];
    if (!validDuraciones.includes(dto.duracionMinutos)) {
      throw new BadRequestException('Duración inválida. Valores válidos: 30, 60, 90, 120, 180');
    }

    if (dto.monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    const existing = await this.tarifaRepository.findOne({
      where: {
        deporte: dto.deporte,
        duracionMinutos: dto.duracionMinutos,
        franja: dto.franja,
      },
    });
    if (existing) {
      throw new ConflictException('Ya existe una tarifa para esa combinación de deporte, duración y franja');
    }

    const tarifa = this.tarifaRepository.create({
      deporte: dto.deporte,
      duracionMinutos: dto.duracionMinutos,
      franja: dto.franja,
      monto: dto.monto,
    });

    return this.tarifaRepository.save(tarifa);
  }

  async updateTarifa(id: number, dto: UpdateTarifaDto, user: any): Promise<Tarifa> {
    this.validateAdminAccess(user);

    const tarifa = await this.tarifaRepository.findOne({ where: { id } });
    if (!tarifa) {
      throw new NotFoundException(`Tarifa con id ${id} no encontrada`);
    }

    if (dto.monto !== undefined) {
      if (dto.monto <= 0) {
        throw new BadRequestException('El monto debe ser mayor a 0');
      }
      tarifa.monto = dto.monto;
    }

    return this.tarifaRepository.save(tarifa);
  }

  async createBloqueoJugador(dto: CreateBloqueoJugadorDto, user: any): Promise<BloqueoJugador> {
    this.validateAdminAccess(user);

    const jugador = await this.jugadorRepository.findOne({
      where: { id: dto.jugadorId },
    });
    if (!jugador) {
      throw new NotFoundException(`Jugador con id ${dto.jugadorId} no encontrado`);
    }

    if (dto.fin <= dto.inicio) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    const existingBloqueo = await this.bloqueoJugadorRepository.findOne({
      where: {
        jugadorId: dto.jugadorId,
        inicio: Between(dto.inicio, dto.fin),
      },
    });
    if (existingBloqueo) {
      throw new ConflictException('El jugador ya tiene un bloqueo activo en ese período');
    }

    const bloqueo = this.bloqueoJugadorRepository.create({
      jugadorId: dto.jugadorId,
      creadoPorId: user.id,
      motivo: dto.motivo,
      inicio: dto.inicio,
      fin: dto.fin,
    });

    const savedBloqueo = await this.bloqueoJugadorRepository.save(bloqueo);

    if (user.role === 'administrador') {
      jugador.bloqueado = true;
      await this.jugadorRepository.save(jugador);
    }

    return this.getBloqueoJugadorById(savedBloqueo.id, user);
  }

  async getBloqueoJugadorById(id: number, user: any): Promise<BloqueoJugador> {
    this.validateAdminAccess(user);
    const bloqueo = await this.bloqueoJugadorRepository.findOne({
      where: { id },
      relations: ['jugador', 'creadoPor'],
    });
    if (!bloqueo) {
      throw new NotFoundException(`Bloqueo con id ${id} no encontrado`);
    }
    return bloqueo;
  }

  async getBloqueosJugador(user: any, jugadorId?: number): Promise<BloqueoJugador[]> {
    this.validateAdminAccess(user);

    const whereClause = jugadorId ? { jugadorId } : {};
    return this.bloqueoJugadorRepository.find({
      where: whereClause,
      relations: ['jugador', 'creadoPor'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteBloqueoJugador(id: number, user: any): Promise<void> {
    this.validateAdminAccess(user);

    const bloqueo = await this.bloqueoJugadorRepository.findOne({
      where: { id },
      relations: ['jugador'],
    });
    if (!bloqueo) {
      throw new NotFoundException(`Bloqueo con id ${id} no encontrado`);
    }

    const activeBloqueos = await this.bloqueoJugadorRepository.count({
      where: {
        jugadorId: bloqueo.jugadorId,
        fin: Between(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      },
    });

    await this.bloqueoJugadorRepository.remove(bloqueo);

    if (activeBloqueos <= 1) {
      const jugador = await this.jugadorRepository.findOne({
        where: { id: bloqueo.jugadorId },
      });
      if (jugador) {
        jugador.bloqueado = false;
        await this.jugadorRepository.save(jugador);
      }
    }
  }

  private validateAdminAccess(user: any): void {
    if (user.role !== 'administrador') {
      throw new ForbiddenException('Solo el administrador puede realizar esta acción');
    }
  }
}
