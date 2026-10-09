import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { AuthFailure, AuthService } from './auth.service';
import { LoginRequestDto, RegisterRequestDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public() @Post('register')
  async register(@Body() request: RegisterRequestDto, @Res({ passthrough: true }) res: Response) {
    try { res.status(HttpStatus.CREATED); return await this.auth.register(request); }
    catch (e) { res.status(HttpStatus.BAD_REQUEST); return e instanceof Error ? e.message : 'Error de registro'; }
  }

  @Public() @Post('login') @HttpCode(HttpStatus.OK)
  async login(@Body() request: LoginRequestDto, @Res({ passthrough: true }) res: Response) {
    try { return await this.auth.login(request); }
    catch (e) {
      if (e instanceof AuthFailure) {
        res.status(HttpStatus.UNAUTHORIZED);
        if (e.reason === 'LOCKED') return 'Usuario bloqueado temporalmente';
        if (e.reason === 'DISABLED') return 'Usuario inactivo';
        return 'Usuario o contraseña incorrectos';
      }
      throw e;
    }
  }
}
