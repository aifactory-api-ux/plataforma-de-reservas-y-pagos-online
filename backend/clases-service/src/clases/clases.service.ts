import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Clase } from './entities/clase.entity';
import { InscripcionClase } from './entities/inscripcion-clase.entity';
import { Cancha } from '../球场/cancha.entity';
import { Jugador } from './entities/jugador.entity';
import { CreateClaseDto, UpdateClaseDto } from './dto';

@Injectable()
export class ClasesService {
  constructor(
    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,
    @InjectRepository(InscripcionClase)
    private readonly inscripcionRepository: Repository<InscripcionClase>,
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Jugador)
    private readonly jugadorRepository: Repository<Jugador>,
  ) {}

  async findAllClases(filters: {
    canchaId?: number;
    profesorId?: number;
    fecha?: Date;
  }): Promise<Clase[]> {
    const where: any = {};

    if (filters.canchaId) {
      where.canchaId = filters.canchaId;
    }

    if (filters.profesorId) {
      where.profesorId = filters.profesorId;
    }

    if (filters.fecha) {
      const startOfDay = new Date(filters.fecha);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.fecha);
      endOfDay.setHours(23, 59, 59, 999);

      where.inicio = MoreThanOrEqual(startOfDay);
    }

    return this.claseRepository.find({
      where,
      relations: ['cancha', 'profesor', 'inscripciones'],
      order: { inicio: 'ASC' },
    });
  }

  async findClaseById(id: number): Promise<Clase> {
    const clase = await this.claseRepository.findOne({
      where: { id },
      relations: ['cancha', 'profesor', 'inscripciones'],
    });

    if (!clase) {
      throw new NotFoundException(`Clase con id ${id} no encontrada`);
    }

    return clase;
  }

  async createClase(createClaseDto: CreateClaseDto): Promise<Clase> {
    const cancha = await this.canchaRepository.findOne({
      where: { id: createClaseDto.canchaId },
    });

    if (!cancha) {
      throw new NotFoundException(`Cancha con id ${createClaseDto.canchaId} no encontrada`);
    }

    if (createClaseDto.cupos < 1 || createClaseDto.cupos > 50) {
      throw new BadRequestException('Los cupos deben estar entre 1 y 50');
    }

    const inicioDate = new Date(createClaseDto.inicio);
    const finDate = new Date(createClaseDto.fin);

    if (finDate <= inicioDate) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    const clase = this.claseRepository.create({
      ...createClaseDto,
      inicio: inicioDate,
      fin: finDate,
    });

    return this.claseRepository.save(clase);
  }

  async updateClase(
    id: number,
    updateClaseDto: UpdateClaseDto,
  ): Promise<Clase> {
    const clase = await this.findClaseById(id);

    if (updateClaseDto.cupos !== undefined) {
      if (updateClaseDto.cupos < 1 || updateClaseDto.cupos > 50) {
        throw new BadRequestException('Los cupos deben estar entre 1 y 50');
      }

      const inscripcionesActivas = clase.inscripciones?.filter(
        (i) => i.estado === 'activa',
      ).length || 0;

      if (updateClaseDto.cupos < inscripcionesActivas) {
        throw new BadRequestException(
          `No se puede reducir los cupos a ${updateClaseDto.cupos} porque ya hay ${inscripcionesActivas} inscripciones activas`,
        );
      }
    }

    if (updateClaseDto.inicio && updateClaseDto.fin) {
      const inicioDate = new Date(updateClaseDto.inicio);
      const finDate = new Date(updateClaseDto.fin);
      if (finDate <= inicioDate) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    Object.assign(clase, updateClaseDto);

    return this.claseRepository.save(clase);
  }

  async deleteClase(id: number): Promise<void> {
    const clase = await this.findClaseById(id);

    const inscripcionesActivas = clase.inscripciones?.filter(
      (i) => i.estado === 'activa',
    ).length || 0;

    if (inscripcionesActivas > 0) {
      throw new BadRequestException(
        `No se puede eliminar la clase porque tiene ${inscripcionesActivas} inscripciones activas`,
      );
    }

    await this.claseRepository.remove(clase);
  }

  async inscribirJugador(
    claseId: number,
    jugadorId: number,
    user: any,
  ): Promise<InscripcionClase> {
    const clase = await this.findClaseById(claseId);

    const jugador = await this.jugadorRepository.findOne({
      where: { id: jugadorId },
    });

    if (!jugador) {
      throw new NotFoundException(`Jugador con id ${jugadorId} no encontrado`);
    }

    if (jugador.bloqueado) {
      throw new ForbiddenException('El jugador está bloqueado y no puede inscribirse');
    }

    const inscripcionExistente = await this.inscripcionRepository.findOne({
      where: {
        claseId,
        jugadorId,
        estado: 'activa',
      },
    });

    if (inscripcionExistente) {
      throw new BadRequestException('El jugador ya está inscrito en esta clase');
    }

    const inscripcionesActivas = clase.inscripciones?.filter(
      (i) => i.estado === 'activa',
    ).length || 0;

    if (inscripcionesActivas >= clase.cupos) {
      throw new BadRequestException('No hay cupos disponibles en esta clase');
    }

    const inscripcion = this.inscripcionRepository.create({
      claseId,
      jugadorId,
      inscritaEn: new Date(),
      estado: 'activa',
    });

    return this.inscripcionRepository.save(inscripcion);
  }

  async desinscribirJugador(
    claseId: number,
    jugadorId: number,
    user: any,
  ): Promise<InscripcionClase> {
    const inscripcion = await this.inscripcionRepository.findOne({
      where: {
        claseId,
        jugadorId,
        estado: 'activa',
      },
      relations: ['clase'],
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripcion no encontrada para jugador ${jugadorId} en clase ${claseId}`,
      );
    }

    inscripcion.estado = 'cancelada';

    return this.inscripcionRepository.save(inscripcion);
  }

  async getInscripcionesDeClase(claseId: number): Promise<InscripcionClase[]> {
    await this.findClaseById(claseId);

    return this.inscripcionRepository.find({
      where: { claseId },
      relations: ['jugador', 'clase'],
      order: { inscritaEn: 'ASC' },
    });
  }

  async getCuposDisponibles(claseId: number): Promise<number> {
    const clase = await this.findClaseById(claseId);
    const inscripcionesActivas = clase.inscripciones?.filter(
      (i) => i.estado === 'activa',
    ).length || 0;
    return clase.cupos - inscripcionesActivas;
  }
}