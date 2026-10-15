import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { GetDisponibilidadDto } from './dto/get-disponibilidad.dto';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async createReserva(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.createReserva(createReservaDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAllReservas() {
    return this.reservasService.findAllReservas();
  }

  @Get('disponibilidad')
  async getDisponibilidad(@Query() getDisponibilidadDto: GetDisponibilidadDto) {
    return this.reservasService.getDisponibilidad(getDisponibilidadDto);
  }

  @Get('jugador/:jugadorId')
  @UseGuards(AuthGuard('jwt'))
  async findReservasByJugador(@Param('jugadorId', ParseIntPipe) jugadorId: number) {
    return this.reservasService.findReservasByJugador(jugadorId);
  }

  @Get('cancha/:canchaId')
  @UseGuards(AuthGuard('jwt'))
  async findReservasByCancha(
    @Param('canchaId', ParseIntPipe) canchaId: number,
    @Query('fecha') fecha: string,
  ) {
    const fechaParsed = new Date(fecha);
    return this.reservasService.findReservasByCancha(canchaId, fechaParsed);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findReservaById(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.findReservaById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateReserva(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservaDto: UpdateReservaDto,
  ) {
    return this.reservasService.updateReserva(id, updateReservaDto);
  }

  @Post(':id/cancelar')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async cancelarReserva(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.cancelarReserva(id);
  }

  @Post(':id/asistencia')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async marcarAsistencia(
    @Param('id', ParseIntPipe) id: number,
    @Body('asistio') asistio: boolean,
  ) {
    return this.reservasService.marcarAsistencia(id, asistio);
  }

  @Post(':id/liberar')
  @HttpCode(HttpStatus.OK)
  async liberarReservaExpirada(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.liberarReservaExpirada(id);
  }
}