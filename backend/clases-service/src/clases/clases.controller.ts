import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ClasesService } from './clases.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { InscribirJugadorDto } from './dto/inscribir-jugador.dto';

@Controller()
export class ClasesController {
  constructor(private readonly clasesService: ClasesService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'clases-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('clases')
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('canchaId') canchaId?: string,
    @Query('profesorId') profesorId?: string,
    @Query('fecha') fecha?: string,
  ) {
    const filters: { canchaId?: number; profesorId?: number; fecha?: Date } = {};
    if (canchaId) filters.canchaId = parseInt(canchaId, 10);
    if (profesorId) filters.profesorId = parseInt(profesorId, 10);
    if (fecha) filters.fecha = new Date(fecha);

    const clases = await this.clasesService.findAllClases(filters);
    return {
      success: true,
      data: clases,
    };
  }

  @Get('clases/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const clase = await this.clasesService.findClaseById(parseInt(id, 10));
    return {
      success: true,
      data: clase,
    };
  }

  @Post('clases')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async create(@Body() createClaseDto: CreateClaseDto) {
    const clase = await this.clasesService.createClase(createClaseDto);
    return {
      success: true,
      data: clase,
    };
  }

  @Put('clases/:id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateClaseDto: UpdateClaseDto) {
    const clase = await this.clasesService.updateClase(parseInt(id, 10), updateClaseDto);
    return {
      success: true,
      data: clase,
    };
  }

  @Delete('clases/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.clasesService.deleteClase(parseInt(id, 10));
    return {
      success: true,
      message: 'Clase eliminada correctamente',
    };
  }

  @Post('clases/:id/inscribir')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async inscribir(@Param('id') id: string, @Body() inscribirDto: InscribirJugadorDto, @Request() req: any) {
    const result = await this.clasesService.inscribirJugador(
      parseInt(id, 10),
      inscribirDto.jugadorId,
      req.user,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Delete('clases/:id/inscribir/:jugadorId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async desinscribir(
    @Param('id') id: string,
    @Param('jugadorId') jugadorId: string,
    @Request() req: any,
  ) {
    const result = await this.clasesService.desinscribirJugador(
      parseInt(id, 10),
      parseInt(jugadorId, 10),
      req.user,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('clases/:id/inscripciones')
  @UseGuards(JwtAuthGuard)
  async getInscripciones(@Param('id') id: string) {
    const inscripciones = await this.clasesService.getInscripcionesDeClase(parseInt(id, 10));
    return {
      success: true,
      data: inscripciones,
    };
  }

  @Get('clases/:id/cupos')
  @UseGuards(JwtAuthGuard)
  async getCuposDisponibles(@Param('id') id: string) {
    const cupos = await this.clasesService.getCuposDisponibles(parseInt(id, 10));
    return {
      success: true,
      data: { cuposDisponibles: cupos },
    };
  }
}