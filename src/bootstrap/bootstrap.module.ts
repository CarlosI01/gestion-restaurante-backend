import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppRole } from '../database/entities';
import { BootstrapService } from './bootstrap.service';
@Module({ imports: [TypeOrmModule.forFeature([AppRole])], providers: [BootstrapService] })
export class BootstrapModule {}
