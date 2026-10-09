import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IsNull, Repository } from 'typeorm';
import { StaffUser } from '../database/entities';

export interface AuthUser { id: string; email: string; role: string; permissions: string[]; }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, @InjectRepository(StaffUser) private readonly users: Repository<StaffUser>) {
    const encoded = config.getOrThrow<string>('JWT_SECRET_BASE64');
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: Buffer.from(encoded, 'base64') });
  }

  async validate(payload: { sub: string; role?: string }): Promise<AuthUser> {
    const user = await this.users.findOne({ where: { email: payload.sub, deletedAt: IsNull() }, relations: { role: { permissions: true } } });
    if (!user || !user.isActive) throw new UnauthorizedException('Usuario no autorizado');
    return {
      id: user.id,
      email: user.email,
      role: user.role.code,
      permissions: (user.role.permissions ?? []).filter((p) => p.isActive).map((p) => p.code),
    };
  }
}
