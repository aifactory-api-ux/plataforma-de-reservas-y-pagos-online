import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { SedesService } from './sedes.service';
import { AgendaService } from './agenda.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('sedes')
@UseGuards(JwtAuthGuard)
export class SedesController {
  constructor(
    private readonly sedesService: SedesService,
    private readonly agendaService: AgendaService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'sedes-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async findAll() {
    const sedes = await this.sedesService.findAllSedes();
    return {
      success: true,
      data: sedes,
    };
  }

  @Get('mis-sedes')
  async getMisSedes(@Request() req: any) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userSedeId = req.user?.sedeId;

    const sedes = await this.sedesService.findSedesByUsuarioPersonal(userId);
    return {
      success: true,
      data: sedes,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const sede = await this.sedesService.findSedeById(parseInt(id));
    return {
      success: true,
      data: sede,
    };
  }

  @Get(':id/canchas')
  async findCanchas(@Param('id') id: string) {
    const canchas = await this.sedesService.findCanchasBySede(parseInt(id));
    return {
      success: true,
      data: canchas,
    };
  }

  @Get('canchas/:canchaId')
  async findCancha(@Param('canchaId') canchaId: string) {
    const cancha = await this.sedesService.findCanchaById(parseInt(canchaId));
    return {
      success: true,
      data: cancha,
    };
  }

  @Get('tarifas')
  async getTarifas(@Query('deporte') deporte?: string) {
    if (deporte) {
      const tarifas = await this.sedesService.findTarifasByDeporte(deporte as 'padel' | 'futbol7');
      return { success: true, data: tarifas };
    }
    const tarifas = await this.sedesService.getTarifas();
    return { success: true, data: tarifas };
  }

  @Get(':id/agenda')
  async getAgenda(
    @Param('id') id: string,
    @Query('fecha') fecha: string,
    @Query('franja') franja: 'manana' | 'tarde' | 'noche' | 'completa' = 'completa',
    @Request() req: any,
  ) {
    const sedeId = parseInt(id);
    const userRole = req.user?.role;
    const userSedeId = req.user?.sedeId;

    const hasAccess = await this.sedesService.validarAccesoSede(sedeId, req.user?.id, userRole, userSedeId);
    if (!hasAccess) {
      return {
        success: false,
        error: 'No tienes acceso a esta sede',
        statusCode: HttpStatus.FORBIDDEN,
      };
    }

    const fechaDate = fecha ? new Date(fecha) : new Date();
    const agenda = await this.agendaService.getAgendaDiaria(sedeId, fechaDate, franja);
    return {
      success: true,
      data: agenda,
    };
  }

  @Get(':id/resumen')
  async getResumen(
    @Param('id') id: string,
    @Query('fecha') fecha: string,
    @Request() req: any,
  ) {
    const sedeId = parseInt(id);
    const userRole = req.user?.role;
    const userSedeId = req.user?.sedeId;

    const hasAccess = await this.sedesService.validarAccesoSede(sedeId, req.user?.id, userRole, userSedeId);
    if (!hasAccess) {
      return {
        success: false,
        error: 'No tienes acceso a esta sede',
        statusCode: HttpStatus.FORBIDDEN,
      };
    }

    const fechaDate = fecha ? new Date(fecha) : new Date();
    const resumen = await this.agendaService.getResumenOcupacion(sedeId, fechaDate);
    return {
      success: true,
      data: resumen,
    };
  }

  @Get(':id/estadisticas')
  async getEstadisticas(
    @Param('id') id: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Request() req: any,
  ) {
    const sedeId = parseInt(id);
    const userRole = req.user?.role;
    const userSedeId = req.user?.sedeId;

    const estadisticas = await this.sedesService.getEstadisticasOcupacion(
      sedeId,
      new Date(fechaInicio),
      new Date(fechaFin),
      req.user?.id,
      userRole,
      userSedeId,
    );
    return {
      success: true,
      data: estadisticas,
    };
  }
}
