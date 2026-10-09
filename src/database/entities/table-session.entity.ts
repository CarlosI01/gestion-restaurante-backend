import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RestaurantTable } from './restaurant-table.entity';
import { StaffUser } from './staff-user.entity';

@Entity({ name: 'table_session', schema: 'public' })
export class TableSession {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'table_id', type: 'bigint' }) idTable: string;
  @ManyToOne(() => RestaurantTable) @JoinColumn({ name: 'table_id' }) table: RestaurantTable;
  @Column({ name: 'opened_by', type: 'bigint', nullable: true }) idOpenedBy: string | null;
  @ManyToOne(() => StaffUser, { nullable: true }) @JoinColumn({ name: 'opened_by' }) openedBy: StaffUser | null;
  @Column({  name: 'closed_by', type: 'bigint', nullable: true }) idClosedBy: string | null;
  @ManyToOne(() => StaffUser, { nullable: true }) @JoinColumn({ name: 'closed_by' }) closedBy: StaffUser | null;
  @Column({ length: 20 }) status: string;
  @Column({ name: 'guest_count', type: 'integer', nullable: true }) guestCount: number | null;
  @Column({ type: 'text', nullable: true }) notes: string | null;
  @Column({ name: 'opened_at', type: 'timestamp' }) openedAt: Date;
  @Column({ name: 'closed_at', type: 'timestamp', nullable: true }) closedAt: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' }) updatedAt: Date;
  @BeforeInsert() setOpenedAt() { this.openedAt ??= new Date(); }
}
