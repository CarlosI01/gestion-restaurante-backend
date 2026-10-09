import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CustomerOrder } from './customer-order.entity';
import { CustomerOrderItemExtra } from './customer-order-item-extra.entity';
import { KitchenStation } from './kitchen-station.entity';
import { MenuItem } from './menu-item.entity';
import { numericTransformer } from './numeric.transformer';

@Entity({ name: 'customer_order_item', schema: 'public' })
export class CustomerOrderItem {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'order_id', type: 'bigint' }) idCustomerOrder: string;
  @ManyToOne(() => CustomerOrder, (order) => order.orderItems) @JoinColumn({ name: 'order_id' }) order: CustomerOrder;
  @Column({ name: 'menu_item_id', type: 'bigint', nullable: true }) idMenuItem: string | null;
  @ManyToOne(() => MenuItem, { nullable: true }) @JoinColumn({ name: 'menu_item_id' }) menuItem: MenuItem | null;
  @Column({ name: 'station_id', type: 'bigint' }) idStation: string;
  @ManyToOne(() => KitchenStation) @JoinColumn({ name: 'station_id' }) station: KitchenStation;
  @Column({ length: 30 }) status: string;
  @Column({ name: 'product_name_snapshot', length: 140 }) productNameSnapshot: string;
  @Column({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer }) unitPrice: number;
  @Column({ type: 'integer' }) quantity: number;
  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer }) subtotal: number;
  @Column({ type: 'text', nullable: true }) notes: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' }) updatedAt: Date;
  @Column({ name: 'started_at', type: 'timestamp', nullable: true }) startedAt: Date | null;
  @Column({ name: 'ready_at', type: 'timestamp', nullable: true }) readyAt: Date | null;
  @Column({ name: 'served_at', type: 'timestamp', nullable: true }) servedAt: Date | null;
  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true }) cancelledAt: Date | null;
  @OneToMany(() => CustomerOrderItemExtra, (extra) => extra.orderItem, { cascade: true }) extras: CustomerOrderItemExtra[];
}
