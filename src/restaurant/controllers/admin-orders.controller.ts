import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCustomerOrderRequestDto, CustomerOrderDto } from '../dto/restaurant.dto';
import { CustomerOrderService } from '../services/customer-order.service';
import { OrderSessionService } from '../services/order-session.service';

@Controller('api/admin/orders')
@Roles('ADMIN')
export class AdminOrdersController {
  constructor(private readonly orders: CustomerOrderService, private readonly sessions: OrderSessionService) {}
  @Get() list() { return this.orders.getCustomerOrder(); }
  @Post('status') status(@Body() dto: CustomerOrderDto) { return this.sessions.cambioStatusCustomerOrder(dto); }
  @Get('active') active() { return this.sessions.getActiveOrders(); }
  @Post('service/waiter/attend') waiter(@Body() dto: CreateCustomerOrderRequestDto) { return this.sessions.attendWaiterRequest(dto); }
  @Post('service/bill/attend') bill(@Body() dto: CreateCustomerOrderRequestDto) { return this.sessions.attendBillRequest(dto); }
}
