import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { RestaurantTableDto } from '../dto/restaurant.dto';
import { RestaurantTableService } from '../services/restaurant-table.service';
import { TableSessionService } from '../services/table-session.service';

@Controller('api/admin/tables')
@Roles('ADMIN')
export class AdminTablesController {
  constructor(private readonly service: RestaurantTableService) {}
  @Post('create') create() { return this.service.createTable(); }
  @Get() list() { return this.service.getTablesWithQr(); }
  @Get('count') count() { return this.service.getCountTotalTables(); }
  @Post('generate-missing-qrs') generate() { return this.service.generateQrForExistingTables(); }
  @Put('active-status') active(@Body() dto: RestaurantTableDto) { return this.service.updateTableActiveStatus(dto); }
}

@Controller('api/admin/table-sessions')
@Roles('ADMIN')
export class AdminTableSessionsController {
  constructor(private readonly service: TableSessionService) {}
  @Get('count/active') active() { return this.service.getCountActiveSessionsToday(); }
  @Get('count/active-tables') activeTables() { return this.service.getCountNumberTableToday(); }
}
