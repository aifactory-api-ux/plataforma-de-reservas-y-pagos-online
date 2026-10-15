import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SedesController } from './sedes/sedes.controller';
import { SedesService } from './sedes/sedes.service';
import { AgendaService } from './sedes/agenda.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { Sede } from './sedes/entities/sede.entity';
import { Cancha } from './sedes/entities/cancha.entity';
import { Tarifa } from './sedes/entities/tarifa.entity';
import { Reserva } from './sedes/entities/reserva.entity';
import { BloqueoCancha } from './sedes/entities/bloqueo-cancha.entity';
import { Jugador } from './sedes/entities/jugador.entity';
import { UsuarioPersonal } from './sedes/entities/usuario-personal.entity';
import { Clase } from './sedes/entities/clase.entity';
import { InscripcionClase } from './sedes/entities/inscripcion-clase.entity';
import { Pago } from './sedes/entities/pago.entity';
import { Devolucion } from './sedes/entities/devolucion.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'sporty',
      entities: [Sede, Cancha, Tarifa, Reserva, BloqueoCancha, Jugador, UsuarioPersonal, Clase, InscripcionClase, Pago, Devolucion],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Sede, Cancha, Tarifa, Reserva, BloqueoCancha, Jugador, UsuarioPersonal, Clase, InscripcionClase, Pago, Devolucion]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sporty-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [SedesController],
  providers: [SedesService, AgendaService, JwtAuthGuard],
  exports: [SedesService, AgendaService],
})
export class AppModule {}
