import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AppPermission } from './app-permission.entity';

@Entity({ name: 'app_role', schema: 'public' })
export class AppRole {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ length: 50, unique: true }) code: string;
  @Column({ length: 100 }) name: string;
  @Column({type:'varchar', length: 255, nullable: true }) description: string | null;
  @Column({ name: 'is_active', type: 'boolean' }) isActive: boolean;
  @Column({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
  @Column({ name: 'updated_at', type: 'timestamp' }) updatedAt: Date;

  @ManyToMany(() => AppPermission, { eager: true })
  @JoinTable({
    name: 'app_role_permission', schema: 'public',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: AppPermission[];
}
