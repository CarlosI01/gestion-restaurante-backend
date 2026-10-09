import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'allergen', schema: 'public' })
export class Allergen {
  @PrimaryGeneratedColumn({ type: 'integer' }) id: number;
  @Column({ name: 'name', type: 'varchar' }) name: string;
}
