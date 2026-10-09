import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';

@Entity({ name: 'menu_category', schema: 'public' })
export class MenuCategory {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({type: "varchar", name: 'external_code', length: 40, unique: true, nullable: true }) externalCode: string | null;
  @Column({ length: 100 }) name: string;
  @Column({type: "varchar", name: 'icon_key', length: 40, nullable: true }) iconKey: string | null;
  @Column({ name: 'display_order', type: 'integer', default: 0 }) displayOrder: number;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' }) updatedAt: Date;
  @OneToMany(() => MenuItem, (item) => item.category) menuItems: MenuItem[];
}
