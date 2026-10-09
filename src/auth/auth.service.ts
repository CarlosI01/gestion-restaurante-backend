import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { IsNull, Repository } from 'typeorm';
import { AppRole, StaffUser } from '../database/entities';
import { LoginRequestDto, LoginResponseDto, RegisterRequestDto, UserResponseDto } from './auth.dto';

export class AuthFailure extends Error {
  constructor(public readonly reason: 'BAD_CREDENTIALS' | 'LOCKED' | 'DISABLED') { super(reason); }
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(StaffUser) private readonly users: Repository<StaffUser>,
    @InjectRepository(AppRole) private readonly roles: Repository<AppRole>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(request: RegisterRequestDto): Promise<UserResponseDto> { return this.createUser(request, 'STAFF'); }
  async registerByAdmin(request: RegisterRequestDto): Promise<UserResponseDto> {
    if (!request.roleCode) throw new BadRequestException('El rol es obligatorio');
    return this.createUser(request, request.roleCode);
  }

  private async createUser(request: RegisterRequestDto, roleCode: string): Promise<UserResponseDto> {
    if (await this.users.findOne({ where: { email: request.email, deletedAt: IsNull() } })) throw new BadRequestException('El email ya está registrado');
    if (await this.users.findOne({ where: { username: request.username, deletedAt: IsNull() } })) throw new BadRequestException('El username ya está en uso');
    const role = await this.roles.findOne({ where: { code: roleCode, isActive: true }, relations: { permissions: true } });
    if (!role) throw new BadRequestException(`Rol no encontrado: ${roleCode}`);
    const now = new Date();
    const user = this.users.create({
      fullName: request.fullName, email: request.email, username: request.username,
      passwordHash: await bcrypt.hash(request.password, 10), isActive: true, failedLoginAttempts: 0,
      mustChangePassword: false, lockedUntil: null, deletedAt: null, createdAt: now, updatedAt: now, roleId: role.id, role,
    });
    return this.toResponse(await this.users.save(user));
  }

  async login(request: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.users.findOne({ where: { email: request.email, deletedAt: IsNull() }, relations: { role: { permissions: true } } });
    if (!user) throw new AuthFailure('BAD_CREDENTIALS');
    if (!user.isActive) throw new AuthFailure('DISABLED');
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) throw new AuthFailure('LOCKED');

    const matches = await bcrypt.compare(request.password, user.passwordHash);
    if (!matches) {
      const attempts = (user.failedLoginAttempts ?? 0) + 1;
      user.failedLoginAttempts = attempts;
      user.lockedUntil = attempts >= 5 ? new Date(Date.now() + 30 * 60_000) : user.lockedUntil;
      user.updatedAt = new Date();
      await this.users.save(user);
      throw new AuthFailure(attempts >= 5 ? 'LOCKED' : 'BAD_CREDENTIALS');
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();
    await this.users.save(user);

    const expiration = this.config.get<string>('JWT_EXPIRATION', '1h');
    const token = await this.jwt.signAsync({ sub: user.email, role: user.role.code }, { expiresIn: expiration as never });
    return { token, type: 'Bearer' };
  }

  toResponse(user: StaffUser): UserResponseDto {
    return {
      id: Number(user.id), fullName: user.fullName, email: user.email, username: user.username,
      isActive: user.isActive, roles: [user.role.code],
      permissions: (user.role.permissions ?? []).filter((p) => p.isActive).map((p) => p.code), createdAt: user.createdAt,
    };
  }
}
