import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jugador } from '../jugador/jugador.entity';
import { UsuarioPersonal } from '../usuario-personal/usuario-personal.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  type: 'jugador' | 'staff';
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(Jugador)
    private jugadorRepository: Repository<Jugador>,
    @InjectRepository(UsuarioPersonal)
    private usuarioPersonalRepository: Repository<UsuarioPersonal>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type === 'jugador') {
      const jugador = await this.jugadorRepository.findOne({
        where: { id: payload.sub },
      });
      if (!jugador) {
        throw new UnauthorizedException('Jugador no encontrado');
      }
      return {
        id: jugador.id,
        email: jugador.email,
        nombre: jugador.nombre,
        type: 'jugador',
        role: 'jugador',
      };
    }

    if (payload.type === 'staff') {
      const usuario = await this.usuarioPersonalRepository.findOne({
        where: { id: payload.sub, activo: true },
      });
      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }
      return {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        type: 'staff',
        role: usuario.rol,
        sedeId: usuario.sedeId,
      };
    }

    throw new UnauthorizedException('Token inválido');
  }
}
