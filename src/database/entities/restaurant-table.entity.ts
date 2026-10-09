import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'restaurant_table', schema: 'public' })
export class RestaurantTable {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'zone_id', type: 'integer' }) zone: number;
  @Column({ name: 'table_number', type: 'integer', unique: true }) tableNumber: number;
  @Column({ type: 'integer' }) seats: number;
  @Column({type: "varchar", length: 20 }) status: string;
  @Column({ type: "varchar", name: 'qr_token', unique: true, nullable: true }) qrToken: string | null;
  @Column({type: "varchar", name: 'qr_image_url', nullable: true }) qrImageUrl: string | null;
  @Column({type: "varchar", name: 'access_code', unique: true, nullable: true }) accessCode: string | null;
  @Column({ name: 'is_active', type: 'boolean' }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' }) updatedAt: Date;
}
