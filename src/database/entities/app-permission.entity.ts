import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity({ name: 'app_permission', schema: 'public' })
export class AppPermission {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ length: 80, unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;

  // 👈 Añadir type: 'varchar' explícitamente aquí
  @Column({ type: 'varchar', length: 50, nullable: true })
  module: string | null;

  // 👈 Aplica la misma buena práctica aquí
  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}