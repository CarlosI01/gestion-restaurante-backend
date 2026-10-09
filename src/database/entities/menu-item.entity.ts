import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { KitchenStation } from './kitchen-station.entity';
import { MenuCategory } from './menu-category.entity';
import { MenuItemAllergen } from './menu-item-allergen.entity';
import { MenuItemExtra } from './menu-item-extra.entity';
import { numericTransformer } from './numeric.transformer';

@Entity({ name: 'menu_item', schema: 'public' })
export class MenuItem {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'category_id', type: 'bigint' }) idMenuCategory: string;
  @ManyToOne(() => MenuCategory, (category) => category.menuItems) @JoinColumn({ name: 'category_id' }) category: MenuCategory;
  @Column({ name: 'station_id', type: 'bigint' }) idStation: string;
  @ManyToOne(() => KitchenStation, (station) => station.menuItems) @JoinColumn({ name: 'station_id' }) station: KitchenStation;
  @Column({ type: "varchar",length: 40, unique: true, nullable: true }) sku: string | null;
  @Column({ length: 140 }) name: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'base_price', type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer }) basePrice: number;
  @Column({ name: 'image_url', type: 'text', nullable: true }) imageUrl: string | null;
  @Column({ name: 'is_popular', type: 'boolean', default: false }) isPopular: boolean;
  @Column({ name: 'is_available', type: 'boolean', default: true }) isAvailable: boolean;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @Column({ name: 'display_order', type: 'integer', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' }) updatedAt: Date;
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true }) deletedAt: Date | null;
  @OneToMany(() => MenuItemExtra, (extra) => extra.menuItem) extras: MenuItemExtra[];
  @OneToMany(() => MenuItemAllergen, (allergen) => allergen.menuItem) allergens: MenuItemAllergen[];
}
