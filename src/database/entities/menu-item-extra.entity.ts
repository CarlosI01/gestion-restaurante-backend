import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { numericTransformer } from './numeric.transformer';

@Entity({ name: 'menu_item_extra', schema: 'public' })
export class MenuItemExtra {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'menu_item_id', type: 'bigint' }) idMenuItem: string;
  @ManyToOne(() => MenuItem, (item) => item.extras) @JoinColumn({ name: 'menu_item_id' }) menuItem: MenuItem;
  @Column({ length: 120 }) name: string;
  @Column({ name: 'extra_price', type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer }) extraPrice: number;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @Column({ name: 'display_order', type: 'integer', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' }) updatedAt: Date;
}
