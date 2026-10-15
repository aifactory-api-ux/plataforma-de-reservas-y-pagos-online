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
  HttpCode,
  HttpStatus,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminService, CreateUsuarioDto, UpdateUsuarioDto, CreateTarifaDto, UpdateTarifaDto, CreateBloqueoJugadorDto } from './admin.service';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TarifaDeporte, TarifaFranja } from './entities/tarifa.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly reportesService: ReportesService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'admin-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('usuarios')
  async getUsuarios(@Request() req: any) {
    const usuarios = await this.adminService.getUsuarios(req.user);
    return {
      success: true,
      data: usuarios,
    };
  }

  @Get('usuarios/:id')
  async getUsuarioById(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const usuario = await this.adminService.getUsuarioById(id, req.user);
    return {
      success: true,
      data: usuario,
    };
  }

  @Post('usuarios')
  @HttpCode(HttpStatus.CREATED)
  async createUsuario(@Body() createUsuarioDto: CreateUsuarioDto, @Request() req: any) {
    const usuario = await this.adminService.createUsuario(createUsuarioDto, req.user);
    return {
      success: true,
      data: usuario,
      message: 'Usuario creado exitosamente',
    };
  }

  @Put('usuarios/:id')
  async updateUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Request() req: any,
  ) {
    const usuario = await this.adminService.updateUsuario(id, updateUsuarioDto, req.user);
    return {
      success: true,
      data: usuario,
      message: 'Usuario actualizado exitosamente',
    };
  }

  @Delete('usuarios/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUsuario(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.adminService.deleteUsuario(id, req.user);
    return {
      success: true,
      message: 'Usuario desactivado exitosamente',
    };
  }

  @Get('tarifas')
  async getTarifas(
    @Request() req: any,
    @Query('deporte') deporte?: TarifaDeporte,
  ) {
    const tarifas = await this.adminService.getTarifas(req.user, deporte);
    return {
      success: true,
      data: tarifas,
    };
  }

  @Get('tarifas/:id')
  async getTarifaById(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const tarifa = await this.adminService.getTarifaById(id, req.user);
    return {
      success: true,
      data: tarifa,
    };
  }

  @Post('tarifas')
  @HttpCode(HttpStatus.CREATED)
  async createTarifa(@Body() createTarifaDto: CreateTarifaDto, @Request() req: any) {
    const tarifa = await this.adminService.createTarifa(createTarifaDto, req.user);
    return {
      success: true,
      data: tarifa,
      message: 'Tarifa creada exitosamente',
    };
  }

  @Put('tarifas/:id')
  async updateTarifa(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTarifaDto: UpdateTarifaDto,
    @Request() req: any,
  ) {
    const tarifa = await this.adminService.updateTarifa(id, updateTarifaDto, req.user);
    return {
      success: true,
      data: tarifa,
      message: 'Tarifa actualizada exitosamente',
    };
  }

  @Get('bloqueo-jugador')
  async getBloqueosJugador(
    @Request() req: any,
    @Query('jugadorId') jugadorId?: string,
  ) {
    const bloqueos = await this.adminService.getBloqueosJugador(
      req.user,
      jugadorId ? parseInt(jugadorId, 10) : undefined,
    );
    return {
      success: true,
      data: bloqueos,
    };
  }

  @Get('bloqueo-jugador/:id')
  async getBloqueoJugadorById(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const bloqueo = await this.adminService.getBloqueoJugadorById(id, req.user);
    return {
      success: true,
      data: bloqueo,
    };
  }

  @Post('bloqueo-jugador')
  @HttpCode(HttpStatus.CREATED)
  async createBloqueoJugador(
    @Body() createBloqueoDto: CreateBloqueoJugadorDto,
    @Request() req: any,
  ) {
    const bloqueo = await this.adminService.createBloqueoJugador(createBloqueoDto, req.user);
    return {
      success: true,
      data: bloqueo,
      message: 'Bloqueo creado exitosamente',
    };
  }

  @Delete('bloqueo-jugador/:id')
  @HttpCode(HttpStatus.OK)
  async deleteBloqueoJugador(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.adminService.deleteBloqueoJugador(id, req.user);
    return {
      success: true,
      message: 'Bloqueo eliminado exitosamente',
    };
  }

  @Get('reportes/reservas')
  async getReporteReservas(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('sedeId') sedeId?: string,
    @Query('estado') estado?: string,
    @Query('formato') formato?: string,
    @Request() req: any,
    @Res() res?: Response,
  ) {
    if (formato === 'excel') {
      const buffer = await this.reportesService.getReporteReservasExcel(
        {
          fechaInicio: new Date(fechaInicio),
          fechaFin: new Date(fechaFin),
          sedeId: sedeId ? parseInt(sedeId, 10) : undefined,
          estado,
        },
        req.user,
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte_reservas.xlsx');
      return res.send(buffer);
    }

    const estadisticas = await this.reportesService.getResumenEstadisticas(
      sedeId ? parseInt(sedeId, 10) : undefined,
      new Date(fechaInicio),
      new Date(fechaFin),
      req.user,
    );

    return {
      success: true,
      data: estadisticas,
    };
  }

  @Get('reportes/pagos')
  async getReportePagos(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('sedeId') sedeId?: string,
    @Query('estado') estado?: string,
    @Query('formato') formato?: string,
    @Request() req: any,
    @Res() res?: Response,
  ) {
    if (formato === 'excel') {
      const buffer = await this.reportesService.getReportePagosExcel(
        {
          fechaInicio: new Date(fechaInicio),
          fechaFin: new Date(fechaFin),
          sedeId: sedeId ? parseInt(sedeId, 10) : undefined,
          estado,
        },
        req.user,
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte_pagos.xlsx');
      return res.send(buffer);
    }

    return {
      success: true,
      message: 'Especifica formato=excel para descargar el reporte',
    };
  }

  @Get('reportes/no-shows')
  async getReporteNoShows(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('sedeId', ParseIntPipe) sedeId: number,
    @Query('formato') formato?: string,
    @Request() req: any,
    @Res() res?: Response,
  ) {
    if (formato === 'excel') {
      const buffer = await this.reportesService.getReporteNoShowsExcel(
        {
          fechaInicio: new Date(fechaInicio),
          fechaFin: new Date(fechaFin),
          sedeId,
        },
        req.user,
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte_no_shows.xlsx');
      return res.send(buffer);
    }

    return {
      success: true,
      message: 'Especifica formato=excel para descargar el reporte',
    };
  }

  @Get('reportes/estadisticas')
  async getEstadisticas(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('sedeId') sedeId?: string,
    @Request() req: any,
  ) {
    const estadisticas = await this.reportesService.getResumenEstadisticas(
      sedeId ? parseInt(sedeId, 10) : undefined,
      new Date(fechaInicio),
      new Date(fechaFin),
      req.user,
    );

    return {
      success: true,
      data: estadisticas,
    };
  }
}
