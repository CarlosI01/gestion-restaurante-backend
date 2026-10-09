import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';

@Entity({ name: 'kitchen_station', schema: 'public' })
export class KitchenStation {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ length: 40, unique: true }) code: string;
  @Column({ length: 80 }) name: string;
  @Column({ name: 'display_order', type: 'integer', default: 0 }) displayOrder: number;
  @Column({type: "varchar", name: 'icon_key', length: 40, nullable: true }) iconKey: string | null;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' }) updatedAt: Date;
  @OneToMany(() => MenuItem, (item) => item.station) menuItems: MenuItem[];
}
