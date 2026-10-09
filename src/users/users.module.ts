import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StaffUser } from '../database/entities';
import { UsersController } from './users.controller';
@Module({ imports: [TypeOrmModule.forFeature([StaffUser]), AuthModule], controllers: [UsersController] })
export class UsersModule {}
