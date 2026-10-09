import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { KitchenStationDto } from '../dto/restaurant.dto';
import { KitchenStationService } from '../services/kitchen-station.service';
@Controller('api/admin/kitchen-stations')
@Roles('ADMIN')
export class AdminKitchenController {
  constructor(private readonly service: KitchenStationService) {}
  @Post() create(@Body() dto: KitchenStationDto) { return this.service.create(dto); }
  @Get() list() { return this.service.list(); }
}
