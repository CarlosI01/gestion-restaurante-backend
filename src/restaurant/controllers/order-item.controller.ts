import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CustomerOrderItemDto } from '../dto/restaurant.dto';
import { CustomerItemService } from '../services/customer-item.service';
@Controller('api/orders/items')
export class OrderItemController {
  constructor(private readonly service: CustomerItemService) {}
  @Public() @Post() create(@Body() dto: CustomerOrderItemDto) { return this.service.create(dto); }
}
