import { Dummy, HeavyDummy } from '../enemyTypes';
import { entity } from '../entity';
import { GameGrid } from '../grid';
import { Inventory } from '../inventory/inventory';

export class WeaponFunctionality {
  attack(
    tileCoords: { x: number; y: number },
    map: GameGrid,
    inventory: Inventory,
    target: entity
  ) {
    if (map.tiles[tileCoords.x][tileCoords.y].entity) {
      let damage = 1;
        if (inventory.equippedWeapon) {
          damage = inventory.equippedWeapon.damage;
        }
        console.log(damage);
      if (target instanceof Dummy && !target.isDead) {
        target.dealDamage(damage);
        console.log('HP: ' + target.health);
        if (target.health <= 0) {
          target.isDead = true;
          map.tiles[tileCoords.x][tileCoords.y].corpseSprite = 'dummyDead.png';
          console.log('Target is dead.');
        }
      } else if(target instanceof HeavyDummy && !target.isDead) {
        target.health -= damage;
        console.log('HP: ' + target.health);
        if (target.health <= 0) {
          target.isDead = true;
          map.tiles[tileCoords.x][tileCoords.y].corpseSprite = 'heavyDummyDead.png';
          console.log('Target is dead.');
        }
      }
    }
  }
}
