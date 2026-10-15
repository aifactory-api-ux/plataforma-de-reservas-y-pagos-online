import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { GoogleStrategy } from './auth/google.strategy';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';

import { Jugador } from './jugador/jugador.entity';
import { UsuarioPersonal } from './usuario-personal/usuario-personal.entity';
import { ConsentimientoDatos } from './consentimiento/consentimiento-datos.entity';

import { Reserva } from './reserva/reserva.entity';
import { Cancha } from './cancha/cancha.entity';
import { Tarifa } from './tarifa/tarifa.entity';
import { Pago } from './pago/pago.entity';
import { Devolucion } from './devolucion/devolucion.entity';
import { BloqueoCancha } from './bloqueo-cancha/bloqueo-cancha.entity';
import { BloqueoJugador } from './bloqueo-jugador/bloqueo-jugador.entity';
import { Clase } from './clase/clase.entity';
import { InscripcionClase } from './inscripcion-clase/inscripcion-clase.entity';
import { Sede } from './sede/sede.entity';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sporty',
      entities: [
        Jugador,
        UsuarioPersonal,
        ConsentimientoDatos,
        Reserva,
        Cancha,
        Tarifa,
        Pago,
        Devolucion,
        BloqueoCancha,
        BloqueoJugador,
        Clase,
        InscripcionClase,
        Sede,
      ],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([
      Jugador,
      UsuarioPersonal,
      ConsentimientoDatos,
      Reserva,
      Cancha,
      Tarifa,
      Pago,
      Devolucion,
      BloqueoCancha,
      BloqueoJugador,
      Clase,
      InscripcionClase,
      Sede,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AppModule {}
