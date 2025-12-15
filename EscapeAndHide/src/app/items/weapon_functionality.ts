import { Entity } from '../entity';
import { GameGrid } from '../grid';
import { Inventory } from '../inventory/inventory';

export class WeaponFunctionality {
  attack(
    tileCoords: { x: number; y: number },
    map: GameGrid,
    inventory: Inventory,
    target: Entity
  ) {
    if (map.tiles[tileCoords.x][tileCoords.y].entity) {
      let damage = 1;
      if (inventory.equippedWeapon) {
        damage = inventory.equippedWeapon.damage;
      }
      console.log(damage);
      if (target.damageable == true) {
        target.takeDamage(damage, 'gunshot', target);
      }
    }
  }
}
