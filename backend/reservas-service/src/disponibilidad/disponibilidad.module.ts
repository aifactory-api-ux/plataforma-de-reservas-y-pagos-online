import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DisponibilidadService } from './disponibilidad.service';
import { Cancha } from '../球场/cancha.entity';
import { Tarifa } from '../球场/tarifas.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { BloqueoCancha } from '../reservas/entities/bloqueo-cancha.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cancha,
      Tarifa,
      Reserva,
      BloqueoCancha,
    ]),
  ],
  providers: [DisponibilidadService],
  exports: [DisponibilidadService],
})
export class DisponibilidadModule {}