import { Controller, Get } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CustomerOrderService } from '../services/customer-order.service';

@Controller('api/admin/reports')
@Roles('ADMIN')
export class AdminReportController {
  constructor(private readonly service: CustomerOrderService) {}
  @Get('total-customer') total() { return this.service.getTotalCustomerDecimal(); }
  @Get('sales-by-day') sales() { return this.service.getSalesByDay(); }
  @Get('top-products') products() { return this.service.getTopProducts(); }
  @Get('top-report') top() { return this.service.getTopReport(); }
  @Get('table-usage') usage() { return this.service.getTableUsageByOrder(); }
}

@Controller('api/admin/dashboard')
@Roles('ADMIN')
export class DashboardController {
  constructor(private readonly service: CustomerOrderService) {}
  @Get('week-summary') summary() { return this.service.getWeekSummary(); }
}
