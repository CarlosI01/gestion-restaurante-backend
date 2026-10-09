import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerOrder } from './customer-order.entity';
import { StaffUser } from './staff-user.entity';

@Entity({ name: 'customer_order_status_history', schema: 'public' })
export class CustomerOrderStatusHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @ManyToOne(() => CustomerOrder, (order) => order.statusHistory) @JoinColumn({ name: 'order_id' }) order: CustomerOrder;
  @Column({type: "varchar", name: 'previous_status', length: 30, nullable: true }) previousStatus: string | null;
  @Column({ type: "varchar",name: 'new_status', length: 30 }) newStatus: string;
  @ManyToOne(() => StaffUser, { nullable: true }) @JoinColumn({ name: 'changed_by_staff_id' }) changedByStaff: StaffUser | null;
  @Column({ type: 'text', nullable: true }) comment: string | null;
  @CreateDateColumn({ name: 'changed_at', type: 'timestamp' }) changedAt: Date;
}
