import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerOrder } from './customer-order.entity';
import { RestaurantTable } from './restaurant-table.entity';
import { StaffUser } from './staff-user.entity';
import { TableSession } from './table-session.entity';

@Entity({ name: 'service_request', schema: 'public' })
export class ServiceRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @ManyToOne(() => RestaurantTable) @JoinColumn({ name: 'table_id' }) table: RestaurantTable;
  @ManyToOne(() => TableSession, { nullable: true }) @JoinColumn({ name: 'table_session_id' }) tableSession: TableSession | null;
  @ManyToOne(() => CustomerOrder, { nullable: true }) @JoinColumn({ name: 'order_id' }) order: CustomerOrder | null;
  @Column({ type: "varchar", name: 'request_type', length: 30 }) requestType: string;
  @Column({ length: 20 }) status: string;
  @Column({ type: 'text', nullable: true }) notes: string | null;
  @CreateDateColumn({ name: 'requested_at', type: 'timestamp' }) requestedAt: Date;
  @Column({ name: 'attended_at', type: 'timestamp', nullable: true }) attendedAt: Date | null;
  @ManyToOne(() => StaffUser, { nullable: true }) @JoinColumn({ name: 'created_by_staff_id' }) createdByStaff: StaffUser | null;
  @ManyToOne(() => StaffUser, { nullable: true }) @JoinColumn({ name: 'attended_by_staff_id' }) attendedByStaff: StaffUser | null;
}
