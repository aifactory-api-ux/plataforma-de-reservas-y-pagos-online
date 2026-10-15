import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';

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
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}