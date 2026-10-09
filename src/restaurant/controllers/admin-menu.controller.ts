import { Body, Controller, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../common/decorators/roles.decorator';
import { MenuCategoryDto, MenuItemDto, MenuItemExtraDto } from '../dto/restaurant.dto';
import { MenuCategoryService } from '../services/menu-category.service';
import { MenuItemService } from '../services/menu-item.service';

@Controller('api/admin/menu')
@Roles('ADMIN')
export class AdminMenuController {
  constructor(private readonly items: MenuItemService) {}
  @Post('items') @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 2 * 1024 * 1024 } }))
  create(@Body() dto: MenuItemDto, @UploadedFile() file?: Express.Multer.File) { return this.items.create(dto, file); }
  @Put('items') @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 2 * 1024 * 1024 } }))
  update(@Body() dto: MenuItemDto, @UploadedFile() file?: Express.Multer.File) { return this.items.update(dto.id, dto, file); }
  @Put('items/delete') delete(@Body() dto: MenuItemDto) { return this.items.deleteItem(dto.id); }
  @Post('items/extras') createExtra(@Body() dto: MenuItemExtraDto) { return this.items.createExtra(dto); }
  @Put('items/extras') updateExtra(@Body() dto: MenuItemExtraDto) { return this.items.updateExtra(dto.id, dto); }
  @Put('items/extras/delete') deleteExtra(@Body() dto: MenuItemExtraDto) { return this.items.deleteExtra(dto.id); }
  @Put('items/availability') availability(@Body() dto: MenuItemDto) { return this.items.availableMenu(dto); }
}

@Controller('api/admin/menu/categories')
@Roles('ADMIN')
export class AdminMenuCategoryController {
  constructor(private readonly categories: MenuCategoryService) {}
  @Post() create(@Body() dto: MenuCategoryDto) { return this.categories.create(dto); }
}
