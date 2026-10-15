import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Jugador } from '../jugador/jugador.entity';
import { UsuarioPersonal } from '../usuario-personal/usuario-personal.entity';
import { ConsentimientoDatos } from '../consentimiento/consentimiento-datos.entity';
import { JwtPayload } from './jwt.strategy';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ConsentDto } from './dto/consent.dto';
import { PasswordResetRequestDto, PasswordResetConfirmDto } from './dto/password-reset.dto';
import { StaffLoginDto } from './dto/staff-login.dto';

const CONSENT_VERSION = '1.0';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Jugador)
    private jugadorRepository: Repository<Jugador>,
    @InjectRepository(UsuarioPersonal)
    private usuarioPersonalRepository: Repository<UsuarioPersonal>,
    @InjectRepository(ConsentimientoDatos)
    private consentimientoRepository: Repository<ConsentimientoDatos>,
    private jwtService: JwtService,
  ) {}

  async googleLogin(googleLoginDto: GoogleLoginDto, googleUser: any) {
    let jugador: Jugador;

    if (googleUser.id) {
      jugador = await this.jugadorRepository.findOne({
        where: { googleId: googleUser.id },
      });
    }

    if (!jugador && googleUser.email) {
      jugador = await this.jugadorRepository.findOne({
        where: { email: googleUser.email },
      });

      if (jugador) {
        jugador.googleId = googleUser.id;
        await this.jugadorRepository.save(jugador);
      }
    }

    if (!jugador) {
      jugador = this.jugadorRepository.create({
        nombre: googleUser.nombre || 'Usuario',
        email: googleUser.email || `${googleUser.id}@google.local`,
        telefono: googleUser.telefono || '',
        googleId: googleUser.id,
        bloqueado: false,
        inasistencias60Dias: 0,
      });
      await this.jugadorRepository.save(jugador);
    }

    if (jugador.bloqueado) {
      throw new UnauthorizedException('Usuario bloqueado. No puede realizar reservas.');
    }

    const tokens = await this.generateTokens(jugador, 'jugador');

    const hasConsent = await this.consentimientoRepository.findOne({
      where: {
        jugadorId: jugador.id,
        version: CONSENT_VERSION,
        aceptado: true,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      usuario: {
        id: jugador.id,
        nombre: jugador.nombre,
        email: jugador.email,
        telefono: jugador.telefono,
        bloqueado: jugador.bloqueado,
        inasistencias60Dias: jugador.inasistencias60Dias,
      },
      requiresConsent: !hasConsent,
    };
  }

  async staffLogin(staffLoginDto: StaffLoginDto) {
    const usuario = await this.usuarioPersonalRepository.findOne({
      where: { email: staffLoginDto.email, activo: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      staffLoginDto.password,
      usuario.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(usuario, 'staff');

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        sedeId: usuario.sedeId,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.type === 'jugador') {
        const jugador = await this.jugadorRepository.findOne({
          where: { id: payload.sub },
        });

        if (!jugador || jugador.bloqueado) {
          throw new UnauthorizedException('Token inválido o usuario bloqueado');
        }

        const tokens = await this.generateTokens(jugador, 'jugador');
        return {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
      }

      if (payload.type === 'staff') {
        const usuario = await this.usuarioPersonalRepository.findOne({
          where: { id: payload.sub, activo: true },
        });

        if (!usuario) {
          throw new UnauthorizedException('Token inválido o usuario inactivo');
        }

        const tokens = await this.generateTokens(usuario, 'staff');
        return {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
      }

      throw new UnauthorizedException('Token inválido');
    } catch (error) {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }
  }

  async logout(refreshToken: string) {
    return { success: true };
  }

  async consentimiento(jugadorId: number, consentDto: ConsentDto) {
    if (!consentDto.aceptado) {
      throw new BadRequestException('Debe aceptar el consentimiento para continuar');
    }

    const jugador = await this.jugadorRepository.findOne({
      where: { id: jugadorId },
    });

    if (!jugador) {
      throw new BadRequestException('Jugador no encontrado');
    }

    if (consentDto.telefono) {
      jugador.telefono = consentDto.telefono;
      await this.jugadorRepository.save(jugador);
    }

    const existingConsent = await this.consentimientoRepository.findOne({
      where: {
        jugadorId,
        version: consentDto.version,
      },
    });

    if (existingConsent) {
      existingConsent.aceptado = true;
      existingConsent.fechaConsentimiento = new Date();
      await this.consentimientoRepository.save(existingConsent);
    } else {
      const consentimiento = this.consentimientoRepository.create({
        jugadorId,
        version: consentDto.version,
        fechaConsentimiento: new Date(),
        aceptado: true,
      });
      await this.consentimientoRepository.save(consentimiento);
    }

    return { success: true, message: 'Consentimiento registrado' };
  }

  async requestPasswordReset(passwordResetDto: PasswordResetRequestDto) {
    const usuario = await this.usuarioPersonalRepository.findOne({
      where: { email: passwordResetDto.email },
    });

    if (!usuario) {
      return { success: true, message: 'Si el email existe, se enviará un enlace de recuperación' };
    }

    const resetToken = this.jwtService.sign(
      { sub: usuario.id, type: 'password-reset' },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '1h',
      },
    );

    console.log(`Password reset token for ${usuario.email}: ${resetToken}`);

    return {
      success: true,
      message: 'Si el email existe, se enviará un enlace de recuperación',
    };
  }

  async resetPassword(resetDto: PasswordResetConfirmDto) {
    try {
      const payload = this.jwtService.verify<{ sub: number; type: string }>(
        resetDto.token,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      if (payload.type !== 'password-reset') {
        throw new BadRequestException('Token inválido');
      }

      const hashedPassword = await bcrypt.hash(resetDto.newPassword, 10);

      await this.usuarioPersonalRepository.update(payload.sub, {
        passwordHash: hashedPassword,
      });

      return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      throw new BadRequestException('Token inválido o expirado');
    }
  }

  async getConsentVersion(): Promise<{ version: string }> {
    return { version: CONSENT_VERSION };
  }

  private async generateTokens(
    user: Jugador | UsuarioPersonal,
    type: 'jugador' | 'staff',
  ) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type,
      role: type === 'staff' ? (user as UsuarioPersonal).rol : 'jugador',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
