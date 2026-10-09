import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { MenuCategoryService } from '../services/menu-category.service';
import { MenuItemService } from '../services/menu-item.service';

@Controller('api/menu')
@Public()
export class PublicMenuController {
  constructor(private readonly categories: MenuCategoryService, private readonly items: MenuItemService) {}
  @Get('categories') getCategories() { return this.categories.list(); }
  @Get('items') getItems() { return this.items.getAll(); }
  @Get('categories/:idCategory/items') getByCategory(@Param('idCategory') id: string) { return this.items.getByCategory(Number(id)); }
}
