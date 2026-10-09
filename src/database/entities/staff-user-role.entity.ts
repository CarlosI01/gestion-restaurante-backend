import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { AppRole } from './app-role.entity';
import { StaffUser } from './staff-user.entity';

@Entity({ name: 'staff_user_role', schema: 'public' })
export class StaffUserRole {
  @PrimaryColumn({ name: 'staff_user_id', type: 'bigint' }) staffUserId: string;
  @PrimaryColumn({ name: 'role_id', type: 'bigint' }) roleId: string;
  @ManyToOne(() => StaffUser) @JoinColumn({ name: 'staff_user_id' }) staffUser: StaffUser;
  @ManyToOne(() => AppRole) @JoinColumn({ name: 'role_id' }) role: AppRole;
  @CreateDateColumn({ name: 'assigned_at', type: 'timestamp' }) assignedAt: Date;
  @ManyToOne(() => StaffUser, { nullable: true }) @JoinColumn({ name: 'assigned_by' }) assignedBy: StaffUser | null;
}
