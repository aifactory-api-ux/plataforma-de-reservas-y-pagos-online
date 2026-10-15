import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jugador } from '../users/entities/jugador.entity';
import { UsuarioPersonal } from '../users/entities/usuario-personal.entity';
import { ConsentimientoDatos } from '../consentimiento/consentimiento-datos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Jugador,
      UsuarioPersonal,
      ConsentimientoDatos,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
