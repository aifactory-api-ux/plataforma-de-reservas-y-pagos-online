import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClasesController } from './clases/clases.controller';
import { ClasesService } from './clases/clases.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { Clase } from './clases/entities/clase.entity';
import { InscripcionClase } from './clases/entities/inscripcion-clase.entity';
import { Cancha } from './球场/cancha.entity';
import { Jugador } from './clases/entities/jugador.entity';
import { UsuarioPersonal } from './clases/entities/usuario-personal.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'sporty',
      entities: [Clase, InscripcionClase, Cancha, Jugador, UsuarioPersonal],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Clase, InscripcionClase, Cancha, Jugador, UsuarioPersonal]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sporty-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [ClasesController],
  providers: [ClasesService, JwtAuthGuard],
  exports: [ClasesService],
})
export class AppModule {}
