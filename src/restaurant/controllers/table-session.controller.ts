import { Body, Controller, Post } from '@nestjs/common';
import { TableSessionDto } from '../dto/restaurant.dto';
import { TableSessionService } from '../services/table-session.service';
@Controller('api/table-sessions')
export class TableSessionController {
  constructor(private readonly service: TableSessionService) {}
  @Post('start') start(@Body() dto: TableSessionDto) { return this.service.create(dto); }
}
