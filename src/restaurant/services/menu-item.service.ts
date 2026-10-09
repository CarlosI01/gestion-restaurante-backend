import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { ResponseUtil } from '../../common/utils/response.util';
import { MenuItem, MenuItemExtra } from '../../database/entities';
import { MenuItemDto, MenuItemExtraDto } from '../dto/restaurant.dto';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectRepository(MenuItem) private readonly items: Repository<MenuItem>,
    @InjectRepository(MenuItemExtra) private readonly extras: Repository<MenuItemExtra>,
    private readonly config: ConfigService,
  ) {}

  private validateImage(file: Express.Multer.File): void {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype.toLowerCase())) throw new BadRequestException('Tipo de imagen no permitido');
    if (file.size > 2 * 1024 * 1024) throw new BadRequestException('La imagen supera el tamaño máximo permitido de 2 MB');
  }

  private async saveImage(file: Express.Multer.File): Promise<string> {
    this.validateImage(file);
    const uploadDir = resolve(this.config.get<string>('UPLOAD_MENU_ITEMS_DIR', 'uploads/menu-items'));
    await mkdir(uploadDir, { recursive: true });
    const safeExt = extname(file.originalname ?? '').toLowerCase();
    const extension = ['.jpg', '.jpeg', '.png', '.webp'].includes(safeExt) ? safeExt : '';
    const fileName = `${randomUUID()}${extension}`;
    await writeFile(resolve(uploadDir, fileName), file.buffer);
    return `/uploads/menu-items/${fileName}`;
  }

  private toDto(item: MenuItem): Record<string, unknown> {
    return {
      id: Number(item.id), sku: item.sku, name: item.name, description: item.description, basePrice: item.basePrice,
      imageUrl: item.imageUrl, isPopular: item.isPopular, isAvailable: item.isAvailable, isActive: item.isActive,
      displayOrder: item.displayOrder, nameCategory: item.category?.name, idCategory: Number(item.idMenuCategory),
      idStation: Number(item.idStation), nameStation: item.station?.name,
      extras: (item.extras ?? []).filter((e) => e.isActive).map((e) => ({ id: Number(e.id), name: e.name, extraPrice: e.extraPrice, isActive: e.isActive, displayOrder: e.displayOrder })),
    };
  }

  async create(dto: MenuItemDto, image?: Express.Multer.File) {
    if (dto.idCategory == null || dto.idStation == null) throw new BadRequestException('Categoría y estación son obligatorias');
    if (!dto.name?.trim()) throw new BadRequestException('El nombre del producto es obligatorio');
    if (dto.basePrice == null || dto.basePrice < 0) throw new BadRequestException('El precio base es obligatorio y no puede ser negativo');
    const entity = this.items.create({
      idMenuCategory: String(dto.idCategory), idStation: String(dto.idStation), sku: dto.sku ?? null,
      name: dto.name.trim(), description: dto.description ?? null, basePrice: dto.basePrice,
      imageUrl: dto.imageUrl ?? null, isPopular: dto.isPopular ?? false, isActive: dto.isActive ?? true,
      displayOrder: dto.displayOrder ?? 0,
    });
    if (image) entity.imageUrl = await this.saveImage(image);
    const saved = await this.items.save(entity);
    return ResponseUtil.success({
      id: Number(saved.id), idCategory: Number(saved.idMenuCategory), idStation: Number(saved.idStation), sku: saved.sku,
      name: saved.name, description: saved.description, basePrice: saved.basePrice, isPopular: saved.isPopular,
      isAvailable: saved.isAvailable, isActive: saved.isActive, displayOrder: saved.displayOrder,
    }, 'Producto creado correctamente');
  }

  async update(id: number | undefined, dto: MenuItemDto, image?: Express.Multer.File) {
    if (id == null) throw new BadRequestException('El id del producto es obligatorio');
    const entity = await this.items.findOneBy({ id: String(id) });
    if (!entity) throw new NotFoundException('Producto no encontrado');
    if (!dto.name?.trim()) throw new BadRequestException('El nombre del producto es obligatorio');
    if (dto.basePrice == null || dto.basePrice < 0) throw new BadRequestException('El precio base es obligatorio y no puede ser negativo');
    if (dto.idCategory != null) entity.idMenuCategory = String(dto.idCategory);
    if (dto.idStation != null) entity.idStation = String(dto.idStation);
    entity.sku = dto.sku ?? null; entity.name = dto.name.trim(); entity.description = dto.description ?? null; entity.basePrice = dto.basePrice;
    entity.isPopular = dto.isPopular ?? entity.isPopular; entity.isAvailable = dto.isAvailable ?? entity.isAvailable;
    entity.isActive = dto.isActive ?? entity.isActive; entity.displayOrder = dto.displayOrder ?? entity.displayOrder;
    if (image) entity.imageUrl = await this.saveImage(image);
    const saved = await this.items.save(entity);
    return ResponseUtil.success({
      id: Number(saved.id), idCategory: Number(saved.idMenuCategory), idStation: Number(saved.idStation), sku: saved.sku,
      name: saved.name, description: saved.description, basePrice: saved.basePrice, imageUrl: saved.imageUrl,
      isPopular: saved.isPopular, isAvailable: saved.isAvailable, isActive: saved.isActive, displayOrder: saved.displayOrder,
    }, 'Producto actualizado correctamente');
  }

  async createExtra(dto: MenuItemExtraDto) {
    if (dto.idMenuItem == null) throw new BadRequestException('El idMenuItem es obligatorio para crear un extra');
    const name = dto.name?.trim(); if (!name) throw new BadRequestException('El nombre del extra es obligatorio');
    if (dto.extraPrice == null || dto.extraPrice < 0) throw new BadRequestException('El precio del extra debe ser mayor o igual a cero');
    await this.extras.save(this.extras.create({ idMenuItem: String(dto.idMenuItem), name, extraPrice: dto.extraPrice, isActive: dto.isActive ?? true, displayOrder: dto.displayOrder ?? 1 }));
    return ResponseUtil.success(null, 'Extra creado correctamente');
  }

  async updateExtra(id: number | undefined, dto: MenuItemExtraDto) {
    if (id == null) throw new BadRequestException('El id del extra es obligatorio');
    const extra = await this.extras.findOneBy({ id: String(id) }); if (!extra) throw new NotFoundException('Extra no encontrado');
    if (!dto.name?.trim()) throw new BadRequestException('El nombre del extra es obligatorio');
    if (dto.extraPrice == null || dto.extraPrice < 0) throw new BadRequestException('El precio del extra debe ser mayor o igual a cero');
    if (dto.displayOrder != null && dto.displayOrder < 0) throw new BadRequestException('El orden de visualización no puede ser negativo');
    if (dto.idMenuItem != null) extra.idMenuItem = String(dto.idMenuItem);
    extra.name = dto.name.trim(); extra.extraPrice = dto.extraPrice;
    if (dto.isActive != null) extra.isActive = dto.isActive;
    if (dto.displayOrder != null) extra.displayOrder = dto.displayOrder;
    await this.extras.save(extra); return ResponseUtil.success(null, 'Extra actualizado correctamente');
  }

  async deleteItem(id?: number) {
    if (id == null) throw new BadRequestException('El id del producto es obligatorio');
    const item = await this.items.findOneBy({ id: String(id) }); if (!item) throw new NotFoundException('Producto no encontrado');
    item.isActive = false; await this.items.save(item); return ResponseUtil.success(null, 'Producto desactivado correctamente');
  }
  async deleteExtra(id?: number) {
    if (id == null) throw new BadRequestException('El id del extra es obligatorio');
    const extra = await this.extras.findOneBy({ id: String(id) }); if (!extra) throw new NotFoundException('Extra no encontrado');
    extra.isActive = false; await this.extras.save(extra); return ResponseUtil.success(null, 'Extra desactivado correctamente');
  }
  async availableMenu(dto: MenuItemDto) {
    if (dto.id == null) return ResponseUtil.error('No se pudo actualizar', null);
    const item = await this.items.findOneBy({ id: String(dto.id) }); if (!item) return ResponseUtil.error('No se pudo actualizar', null);
    item.isAvailable = dto.isAvailable ?? item.isAvailable; await this.items.save(item); return ResponseUtil.success(null, 'producto actualizado');
  }
  async getAll() {
    const rows = await this.items.find({ relations: { category: true, station: true, extras: true } });
    return ResponseUtil.success(rows.map((x) => this.toDto(x)), '');
  }
  async getByCategory(idCategory: number) {
    const qb = this.items.createQueryBuilder('mi').leftJoinAndSelect('mi.category', 'category').leftJoinAndSelect('mi.station', 'station').leftJoinAndSelect('mi.extras', 'extras').where('mi.is_active = true');
    if (idCategory !== 0) qb.andWhere('mi.category_id = :idCategory', { idCategory });
    const rows = await qb.getMany(); return ResponseUtil.success(rows.map((x) => this.toDto(x)), 'Consulta exitosa');
  }
}
