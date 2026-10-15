import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { Jugador } from './entities/jugador.entity';
import { UsuarioPersonal } from './entities/usuario-personal.entity';
import { ConsentimientoDatos } from '../consentimiento/consentimiento-datos.entity';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Jugador,
      UsuarioPersonal,
      ConsentimientoDatos,
    ]),
  ],
  providers: [UsersService, RolesGuard],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
