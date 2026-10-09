import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerOrderItem } from './customer-order-item.entity';
import { MenuItemExtra } from './menu-item-extra.entity';
import { numericTransformer } from './numeric.transformer';

@Entity({ name: 'customer_order_item_extra', schema: 'public' })
export class CustomerOrderItemExtra {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'order_item_id', type: 'bigint' }) idOrderItem: string;
  @ManyToOne(() => CustomerOrderItem, (item) => item.extras) @JoinColumn({ name: 'order_item_id' }) orderItem: CustomerOrderItem;
  @Column({ name: 'menu_item_extra_id', type: 'bigint', nullable: true }) idMenuItemExtra: string | null;
  @ManyToOne(() => MenuItemExtra, { nullable: true }) @JoinColumn({ name: 'menu_item_extra_id' }) menuItemExtra: MenuItemExtra | null;
  @Column({ name: 'extra_name_snapshot', length: 120 }) extraNameSnapshot: string;
  @Column({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer }) unitPrice: number;
  @Column({ type: 'integer', default: 1 }) quantity: number;
  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer }) subtotal: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
}
