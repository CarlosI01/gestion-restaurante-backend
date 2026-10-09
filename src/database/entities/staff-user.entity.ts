import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AppRole } from './app-role.entity';

@Entity({ name: 'staff_user', schema: 'public' })
export class StaffUser {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ length: 120, name: 'full_name' })
  fullName: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 80, unique: true, nullable: true })
  username: string | null;

  @Column({ length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 10, name: 'avatar_text', nullable: true })
  avatarText: string | null;

  @Column({ type: 'boolean', name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'timestamp', name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'integer', name: 'failed_login_attempts' })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', name: 'locked_until', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'boolean', name: 'must_change_password' })
  mustChangePassword: boolean;

  @Column({ type: 'timestamp', name: 'last_password_change_at', nullable: true })
  lastPasswordChangeAt: Date | null;

  @Column({ type: 'varchar', length: 64, name: 'last_login_ip', nullable: true })
  lastLoginIp: string | null;

  // 👈 AQUÍ FALTABA EL type: 'varchar'
  @Column({ type: 'varchar', length: 255, name: 'last_login_user_agent', nullable: true })
  lastLoginUserAgent: string | null;

  @Column({ type: 'bigint', name: 'role_id' })
  roleId: string;

  @ManyToOne(() => AppRole, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: AppRole;
}