import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PagosService } from './pagos.service';
import {
  CreatePagoDto,
  CreatePagoSplitDto,
  ConfirmarPagoDto,
  SolicitarDevolucionDto,
} from './dto/pago.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async crearPago(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.crearPago(createPagoDto);
  }

  @Post('initiate')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async iniciarPago(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.crearPago(createPagoDto);
  }

  @Post('split')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async crearPagoSplit(@Body() createPagoSplitDto: CreatePagoSplitDto) {
    return this.pagosService.crearPagoSplit(createPagoSplitDto);
  }

  @Post('confirmar')
  @HttpCode(HttpStatus.OK)
  async confirmarPago(@Body() body: { token: string }) {
    return this.pagosService.confirmarPago(body.token);
  }

  @Post('confirmar-split')
  @HttpCode(HttpStatus.OK)
  async confirmarPagoSplit(@Body() body: { tokens: string[] }) {
    return this.pagosService.confirmarPagoSplit(body.tokens);
  }

  @Post('manual/:reservaId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async registrarPagoManual(
    @Param('reservaId', ParseIntPipe) reservaId: number,
    @Body() body: { montoRecibido: number },
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    return this.pagosService.registrarPagoManual(
      reservaId,
      body.montoRecibido,
      parseInt(usuarioId, 10),
    );
  }

  @Post('devolucion')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async solicitarDevolucion(
    @Body() solicitarDevolucionDto: SolicitarDevolucionDto,
    @Headers('x-user-role') userRole: string,
  ) {
    return this.pagosService.procesarDevolucion(
      solicitarDevolucionDto.pagoId,
      solicitarDevolucionDto.autorizadoPorId,
      solicitarDevolucionDto.monto,
      solicitarDevolucionDto.motivo,
      userRole,
    );
  }

  @Get('reserva/:reservaId')
  @UseGuards(AuthGuard('jwt'))
  async obtenerPagosPorReserva(@Param('reservaId', ParseIntPipe) reservaId: number) {
    return this.pagosService.obtenerPagosPorReserva(reservaId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async obtenerPagoPorId(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.obtenerPagoPorId(id);
  }

  @Get('devolucion/pago/:pagoId')
  @UseGuards(AuthGuard('jwt'))
  async obtenerDevolucionPorPago(@Param('pagoId', ParseIntPipe) pagoId: number) {
    return this.pagosService.obtenerDevolucionPorPago(pagoId);
  }

  @Get('sede/:sedeId')
  @UseGuards(AuthGuard('jwt'))
  async obtenerPagosPorSede(@Param('sedeId', ParseIntPipe) sedeId: number) {
    return this.pagosService.obtenerPagosPorSede(sedeId);
  }

  @Post('conciliar')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async conciliarPagos() {
    return this.pagosService.conciliarPagos();
  }
}
