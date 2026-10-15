import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasModule } from './reservas/reservas.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';

import {
  Reserva,
  BloqueoCancha,
  BloqueoJugador,
  Jugador,
  Cancha,
  Tarifa,
  Pago,
  Devolucion,
  Clase,
  InscripcionClase,
  ConsentimientoDatos,
  UsuarioPersonal,
  Sede,
} from './reservas/entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sporty',
      entities: [
        Reserva,
        BloqueoCancha,
        BloqueoJugador,
        Jugador,
        Cancha,
        Tarifa,
        Pago,
        Devolucion,
        Clase,
        InscripcionClase,
        ConsentimientoDatos,
        UsuarioPersonal,
        Sede,
      ],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    ReservasModule,
    DisponibilidadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}