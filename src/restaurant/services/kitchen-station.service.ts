import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseUtil } from '../../common/utils/response.util';
import { KitchenStation } from '../../database/entities';
import { KitchenStationDto } from '../dto/restaurant.dto';

@Injectable()
export class KitchenStationService {
  constructor(@InjectRepository(KitchenStation) private readonly repository: Repository<KitchenStation>) {}
  async create(dto: KitchenStationDto) {
    await this.repository.save(this.repository.create({ code: dto.code, name: dto.name, displayOrder: dto.displayOrder ?? 0, iconKey: dto.iconKey ?? null, isActive: dto.isActive ?? true }));
    return ResponseUtil.success(null, 'exito');
  }
  async list() {
    const rows = await this.repository.find();
    return ResponseUtil.success(rows.map((x) => ({ id: Number(x.id), code: x.code, name: x.name, displayOrder: x.displayOrder, iconKey: x.iconKey, isActive: x.isActive })), '');
  }
}
