import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Allergen } from './allergen.entity';
import { MenuItem } from './menu-item.entity';

@Entity({ name: 'menu_item_allergen', schema: 'public' })
export class MenuItemAllergen {
  @PrimaryColumn({ name: 'menu_item_id', type: 'bigint' }) menuItemId: string;
  @PrimaryColumn({ name: 'allergen_id', type: 'bigint' }) allergenId: string;
  @ManyToOne(() => MenuItem, (item) => item.allergens) @JoinColumn({ name: 'menu_item_id' }) menuItem: MenuItem;
  @ManyToOne(() => Allergen) @JoinColumn({ name: 'allergen_id' }) allergen: Allergen;
}
