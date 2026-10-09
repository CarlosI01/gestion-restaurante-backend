import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StaffUser } from './staff-user.entity';

@Entity({ name: 'auth_audit_log', schema: 'public' })
export class AuthAuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @ManyToOne(() => StaffUser, { nullable: true }) @JoinColumn({ name: 'staff_user_id' }) staffUser: StaffUser | null;
  @Column({type: "varchar", name: 'login_identifier', length: 150, nullable: true }) loginIdentifier: string | null;
  @Column({ name: 'event_type', length: 30 }) eventType: string;
  @Column({ type: 'boolean' }) success: boolean;
  @Column({type: "varchar", name: 'ip_address', length: 64, nullable: true }) ipAddress: string | null;
  @Column({type: "varchar", name: 'user_agent', length: 255, nullable: true }) userAgent: string | null;
  @Column({type: "varchar", length: 500, nullable: true }) details: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
}
