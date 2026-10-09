import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { StaffUser } from './staff-user.entity';

@Entity({ name: 'system_config', schema: 'public' })
export class SystemConfig {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'config_key', length: 80, unique: true }) configKey: string;
  @Column({ name: 'config_value', type: 'text' }) configValue: string;
  @Column({ name: 'value_type', length: 20 }) valueType: string;
  @Column({type: "varchar", length: 255, nullable: true }) description: string | null;
  @ManyToOne(() => StaffUser, { nullable: true }) @JoinColumn({ name: 'updated_by' }) updatedBy: StaffUser | null;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' }) updatedAt: Date;
}
