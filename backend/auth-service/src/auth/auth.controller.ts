import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ConsentDto } from './dto/consent.dto';
import { PasswordResetRequestDto, PasswordResetConfirmDto } from './dto/password-reset.dto';
import { StaffLoginDto } from './dto/staff-login.dto';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    const { idToken } = googleLoginDto;

    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    const googleUser = await this.verifyGoogleToken(idToken);

    return this.authService.googleLogin(googleLoginDto, googleUser);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async staffLogin(@Body() staffLoginDto: StaffLoginDto) {
    return this.authService.staffLogin(staffLoginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { refreshToken: string }) {
    return this.authService.logout(body.refreshToken);
  }

  @Post('consent')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async consent(@Request() req: any, @Body() consentDto: ConsentDto) {
    const userId = req.user.id;
    return this.authService.consentimiento(userId, consentDto);
  }

  @Get('consent/version')
  async getConsentVersion() {
    return this.authService.getConsentVersion();
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() passwordResetDto: PasswordResetRequestDto) {
    return this.authService.requestPasswordReset(passwordResetDto);
  }

  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetDto: PasswordResetConfirmDto) {
    return this.authService.resetPassword(resetDto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Request() req: any) {
    return req.user;
  }

  private async verifyGoogleToken(idToken: string): Promise<any> {
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      return {
        id: payload.sub,
        email: payload.email,
        nombre: payload.name,
        fotoUrl: payload.picture,
      };
    } catch (error) {
      throw new Error('Token de Google inválido');
    }
  }
}
