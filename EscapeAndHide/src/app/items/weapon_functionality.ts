import { Dummy, HeavyDummy } from '../enemyTypes';
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
      if (target instanceof Dummy && !target.isDead) {
        target.takeDamage(damage,"gunshot");
      } else if(target instanceof HeavyDummy && !target.isDead) {
        target.takeDamage(damage,"gunshot")
      }
    }
  }
}
