import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permissions } from '../common/decorators/permissions.decorator';
import { StaffUser } from '../database/entities';
import { AuthService } from '../auth/auth.service';
import { RegisterRequestDto } from '../auth/auth.dto';
import type { AuthUser } from '../auth/jwt.strategy';

@Controller('api/users')
@Permissions('USER_VIEW')
export class UsersController {
  constructor(@InjectRepository(StaffUser) private readonly users: Repository<StaffUser>, private readonly auth: AuthService) {}

  @Get('view') view(@Req() req: Request & { user: AuthUser }) { return `Permiso USER_VIEW correcto para ${req.user.email}`; }
  @Get('edit') @Permissions('USER_EDIT') edit(@Req() req: Request & { user: AuthUser }) { return `Permiso USER_EDIT correcto para ${req.user.email}`; }

  @Get()
  async getAll() {
    const users = await this.users.find({ relations: { role: { permissions: true } } });
    return users.map((u) => this.auth.toResponse(u));
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const user = await this.users.findOneOrFail({ where: { id }, relations: { role: { permissions: true } } });
    return this.auth.toResponse(user);
  }

  @Post() @Permissions('USER_EDIT')
  create(@Body() request: RegisterRequestDto) { return this.auth.registerByAdmin(request); }

  @Put(':id/activate') @Permissions('USER_EDIT')
  async activate(@Param('id') id: string) { const user = await this.users.findOneByOrFail({ id }); user.isActive = true; await this.users.save(user); return 'Usuario activado'; }

  @Put(':id/deactivate') @Permissions('USER_EDIT')
  async deactivate(@Param('id') id: string) { const user = await this.users.findOneByOrFail({ id }); user.isActive = false; await this.users.save(user); return 'Usuario desactivado'; }
}
