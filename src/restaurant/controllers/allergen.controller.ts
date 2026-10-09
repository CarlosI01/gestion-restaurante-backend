import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { AllergenService } from '../services/allergen.service';
@Controller('api')
export class AllergenController {
  constructor(private readonly service: AllergenService) {}
  @Public() @Get('allergens') getAll() { return this.service.getAll(); }
}
