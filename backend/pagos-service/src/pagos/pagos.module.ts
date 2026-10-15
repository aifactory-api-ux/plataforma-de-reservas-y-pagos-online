import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { WebpayService } from './webpay.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  Pago,
  Devolucion,
  Reserva,
  Jugador,
  Cancha,
  Tarifa,
  BloqueoCancha,
  BloqueoJugador,
  ConsentimientoDatos,
  Clase,
  InscripcionClase,
  UsuarioPersonal,
  Sede,
} from './entities';

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
        Pago,
        Devolucion,
        Reserva,
        Jugador,
        Cancha,
        Tarifa,
        BloqueoCancha,
        BloqueoJugador,
        ConsentimientoDatos,
        Clase,
        InscripcionClase,
        UsuarioPersonal,
        Sede,
      ],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([
      Pago,
      Devolucion,
      Reserva,
      Jugador,
      Cancha,
      Tarifa,
      BloqueoCancha,
      BloqueoJugador,
      ConsentimientoDatos,
      Clase,
      InscripcionClase,
      UsuarioPersonal,
      Sede,
    ]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [PagosController],
  providers: [PagosService, WebpayService, NotificationsService],
  exports: [PagosService, NotificationsService],
})
export class PagosModule {}
