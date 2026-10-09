import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { AppPermission } from './app-permission.entity';
import { AppRole } from './app-role.entity';

@Entity({ name: 'app_role_permission', schema: 'public' })
export class AppRolePermission {
  @PrimaryColumn({ name: 'role_id', type: 'bigint' }) roleId: string;
  @PrimaryColumn({ name: 'permission_id', type: 'bigint' }) permissionId: string;
  @ManyToOne(() => AppRole, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'role_id' }) role: AppRole;
  @ManyToOne(() => AppPermission, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'permission_id' }) permission: AppPermission;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
}
