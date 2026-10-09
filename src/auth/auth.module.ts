import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppRole, StaffUser } from '../database/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffUser, AppRole]), PassportModule,
    JwtModule.registerAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (config: ConfigService) => ({
      secret: Buffer.from(config.getOrThrow<string>('JWT_SECRET_BASE64'), 'base64'),
    }) }),
  ],
  controllers: [AuthController], providers: [AuthService, JwtStrategy], exports: [AuthService, JwtModule],
})
export class AuthModule {}
