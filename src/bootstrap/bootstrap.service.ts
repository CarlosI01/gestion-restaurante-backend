import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppRole } from '../database/entities';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  constructor(@InjectRepository(AppRole) private readonly roles: Repository<AppRole>) {}
  async onApplicationBootstrap(): Promise<void> {
    for (const [code, description] of [['ADMIN', 'Administrador del sistema'], ['STAFF', 'Usuario staff']] as const) {
      if (!(await this.roles.findOneBy({ code }))) {
        const now = new Date();
        await this.roles.save(this.roles.create({ code, name: code, description, isActive: true, createdAt: now, updatedAt: now, permissions: [] }));
      }
    }
  }
}
