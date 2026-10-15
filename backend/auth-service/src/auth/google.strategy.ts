import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jugador } from '../jugador/jugador.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @InjectRepository(Jugador)
    private jugadorRepository: Repository<Jugador>,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, displayName, emails, photos } = profile;

    const email = emails?.[0]?.value;
    const nombre = displayName || 'Usuario';
    const fotoUrl = photos?.[0]?.value;

    let jugador = await this.jugadorRepository.findOne({
      where: { googleId: id },
    });

    if (!jugador && email) {
      jugador = await this.jugadorRepository.findOne({
        where: { email },
      });

      if (jugador) {
        jugador.googleId = id;
        await this.jugadorRepository.save(jugador);
      }
    }

    if (!jugador) {
      jugador = this.jugadorRepository.create({
        nombre,
        email: email || `${id}@google.local`,
        telefono: '',
        googleId: id,
        bloqueado: false,
        inasistencias60Dias: 0,
      });
      await this.jugadorRepository.save(jugador);
    }

    done(null, {
      id: jugador.id,
      email: jugador.email,
      nombre: jugador.nombre,
      googleId: id,
      fotoUrl,
    });
  }
}
