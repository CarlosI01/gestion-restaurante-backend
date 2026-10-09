import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from './common/decorators/roles.decorator';
import type { AuthUser } from './auth/jwt.strategy';

@Controller('api')
export class AppController {
  @Get('saludo') saludo(@Req() req: Request & { user: AuthUser }) { return `Hola, ${req.user.email}. Token válido.`; }
  @Roles('ADMIN') @Get('admin/panel') admin(@Req() req: Request & { user: AuthUser }) { return `Bienvenido al panel admin, ${req.user.email}`; }
}
