import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Sse } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CreateCustomerOrderRequestDto, CreateSessionAndOrderRequestDto, CustomerOrderDto } from '../dto/restaurant.dto';
import { CustomerOrderService } from '../services/customer-order.service';
import { OrderSessionService } from '../services/order-session.service';
import { ReceptionSseService } from '../services/reception-sse.service';

@Controller('api/orders')
@Public()
export class PublicOrderController {
  constructor(private readonly orders: CustomerOrderService, private readonly sessions: OrderSessionService, private readonly sseService: ReceptionSseService) {}
  @Post() create(@Body() dto: CustomerOrderDto) { return this.orders.createOrderCustomer(dto); }
  @Post('confirm') @HttpCode(HttpStatus.CREATED) confirm(@Body() dto: CreateSessionAndOrderRequestDto) { return this.sessions.confirmOrder(dto); }
  @Post('service-request') requestService(@Body() dto: CreateCustomerOrderRequestDto) { return this.sessions.createService(dto); }
  @Sse(':orderCode/stream') stream(@Param('orderCode') _orderCode: string) { return this.sseService.subscribe(); }
}
