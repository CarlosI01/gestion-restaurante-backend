import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { RestaurantTableService } from '../services/restaurant-table.service';
@Controller('api/tables')
export class PublicTableController {
  constructor(private readonly service: RestaurantTableService) {}
  @Public() @Get('available/:tableNumber') available(@Param('tableNumber') n: string) { return this.service.getValidateIngreso(Number(n)); }
  @Public() @Get('available/qr/:qrToken') availableQr(@Param('qrToken') token: string) { return this.service.getValidateIngresoByQrToken(token); }
}
