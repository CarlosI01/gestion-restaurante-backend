import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'table_zone', schema: 'public' })
export class TableZone {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ length: 60, unique: true }) name: string;
  @Column({ name: 'display_order', type: 'integer', default: 0 }) displayOrder: number;
  @Column({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
  @BeforeInsert() setCreatedAt() { this.createdAt ??= new Date(); }
}
