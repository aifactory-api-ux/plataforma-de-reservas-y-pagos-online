import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { ReportesService } from './admin/reportes.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { UsuarioPersonal } from './admin/entities/usuario-personal.entity';
import { Tarifa } from './admin/entities/tarifa.entity';
import { BloqueoJugador } from './admin/entities/bloqueo-jugador.entity';
import { Jugador } from './admin/entities/jugador.entity';
import { Sede } from './admin/entities/sede.entity';
import { Reserva } from './admin/entities/reserva.entity';
import { Pago } from './admin/entities/pago.entity';
import { Cancha } from './admin/entities/cancha.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sporty',
      entities: [UsuarioPersonal, Tarifa, BloqueoJugador, Jugador, Sede, Reserva, Pago, Cancha],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([UsuarioPersonal, Tarifa, BloqueoJugador, Jugador, Sede, Reserva, Pago, Cancha]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sporty-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, ReportesService, JwtAuthGuard],
  exports: [AdminService, ReportesService],
})
export class AppModule {}
