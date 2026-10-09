import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CustomerOrderItem } from './customer-order-item.entity';
import { CustomerOrderStatusHistory } from './customer-order-status-history.entity';
import { RestaurantTable } from './restaurant-table.entity';
import { StaffUser } from './staff-user.entity';
import { TableSession } from './table-session.entity';
import { numericTransformer } from './numeric.transformer';

@Entity({ name: 'customer_order', schema: 'public' })
export class CustomerOrder {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({type: "varchar", name: 'order_code', length: 40, unique: true }) orderCode: string;
  @Column({ name: 'table_id', type: 'bigint', nullable: true }) idTable: string | null;
  @ManyToOne(() => RestaurantTable, { nullable: true }) @JoinColumn({ name: 'table_id' }) table: RestaurantTable | null;
  @Column({ name: 'table_session_id', type: 'bigint', nullable: true }) idTableSession: string | null;
  @ManyToOne(() => TableSession, { nullable: true }) @JoinColumn({ name: 'table_session_id' }) tableSession: TableSession | null;
  @Column({ name: 'created_by_staff_id', type: 'bigint', nullable: true }) idCreatedByStaff: string | null;
  @ManyToOne(() => StaffUser, { nullable: true }) @JoinColumn({ name: 'created_by_staff_id' }) createdByStaff: StaffUser | null;
  @Column({ length: 30 }) status: string;
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, transformer: numericTransformer }) subtotal: number;
  @Column({ name: 'tax_amount', type: 'numeric', precision: 12, scale: 2, default: 0, transformer: numericTransformer }) taxAmount: number;
  @Column({ name: 'discount_amount', type: 'numeric', precision: 12, scale: 2, default: 0, transformer: numericTransformer }) discountAmount: number;
  @Column({ name: 'service_charge_amount', type: 'numeric', precision: 12, scale: 2, default: 0, transformer: numericTransformer }) serviceChargeAmount: number;
  @Column({ name: 'tip_amount', type: 'numeric', precision: 12, scale: 2, default: 0, transformer: numericTransformer }) tipAmount: number;
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, transformer: numericTransformer }) total: number;
  @Column({ type: 'text', nullable: true }) notes: string | null;
  @Column({ type: 'text', nullable: true }) type: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' }) updatedAt: Date;
  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true }) confirmedAt: Date | null;
  @Column({ name: 'preparation_started_at', type: 'timestamp', nullable: true }) preparationStartedAt: Date | null;
  @Column({ name: 'ready_at', type: 'timestamp', nullable: true }) readyAt: Date | null;
  @Column({ name: 'served_at', type: 'timestamp', nullable: true }) servedAt: Date | null;
  @Column({ name: 'paid_at', type: 'timestamp', nullable: true }) paidAt: Date | null;
  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true }) cancelledAt: Date | null;
  @OneToMany(() => CustomerOrderItem, (item) => item.order) orderItems: CustomerOrderItem[];
  @OneToMany(() => CustomerOrderStatusHistory, (history) => history.order, { cascade: true }) statusHistory: CustomerOrderStatusHistory[];
}
