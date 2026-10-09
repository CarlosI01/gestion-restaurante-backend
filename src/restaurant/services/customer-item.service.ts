import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseUtil } from '../../common/utils/response.util';
import { CustomerOrderItem } from '../../database/entities';
import { CustomerOrderItemDto } from '../dto/restaurant.dto';
@Injectable()
export class CustomerItemService {
  constructor(@InjectRepository(CustomerOrderItem) private readonly items: Repository<CustomerOrderItem>) {}
  async create(dto: CustomerOrderItemDto) {
    if (dto.idCustomerOrder == null) {
      throw new BadRequestException('El id del pedido es obligatorio');
    }
    if (dto.idStation == null) {
      throw new BadRequestException('El id de la estación es obligatorio');
    }

    await this.items.save(this.items.create({
      idCustomerOrder: String(dto.idCustomerOrder), idMenuItem: dto.idMenuItem == null ? null : String(dto.idMenuItem), idStation: String(dto.idStation),
      status: dto.status ?? 'PENDING', productNameSnapshot: dto.productNameSnapshot, unitPrice: dto.unitPrice, quantity: dto.quantity, subtotal: dto.subtotal, notes: dto.notes ?? null,
    }));
    return ResponseUtil.success(null, 'Exito');
  }
}
