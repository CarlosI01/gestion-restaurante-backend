import { Controller, Sse } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReceptionSseService } from '../services/reception-sse.service';
@Controller('api/admin/reception')
@Roles('ADMIN')
export class ReceptionSseController {
  constructor(private readonly service: ReceptionSseService) {}
  @Sse('orders/stream') streamOrders() { return this.service.subscribe(); }
  @Sse('orders/status/stream') streamStatus() { return this.service.subscribe(); }
}
