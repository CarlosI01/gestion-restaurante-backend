import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseUtil } from '../../common/utils/response.util';
import { MenuCategory } from '../../database/entities';
import { MenuCategoryDto } from '../dto/restaurant.dto';

@Injectable()
export class MenuCategoryService {
  constructor(@InjectRepository(MenuCategory) private readonly repository: Repository<MenuCategory>) {}
  async create(dto: MenuCategoryDto) {
    if (!dto) return ResponseUtil.error('El DTO no puede ser nulo', null);
    const entity = this.repository.create({
      ...(dto.id != null ? { id: String(dto.id) } : {}), externalCode: dto.externalCode ?? null,
      name: dto.name, iconKey: dto.iconKey ?? null, displayOrder: dto.displayOrder ?? 0, isActive: dto.isActive ?? true,
    });
    await this.repository.save(entity);
    return ResponseUtil.success(null, 'Creacion exitosa');
  }
  async list() {
    const rows = await this.repository.find();
    return ResponseUtil.success(rows.map((c) => ({
      id: Number(c.id), externalCode: c.externalCode, name: c.name, iconKey: c.iconKey,
      displayOrder: c.displayOrder, isActive: c.isActive,
    })), 'Categorías obtenidas exitosamente');
  }
}
