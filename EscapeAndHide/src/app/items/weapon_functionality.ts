import { Dummy } from '../dummy';
import { GameGrid } from '../grid';
import { Inventory } from '../inventory/inventory';

export class WeaponFunctionality {
  attack(
    tileCoords: { x: number; y: number },
    map: GameGrid,
    inventory: Inventory
  ) {
    if (map.tiles[tileCoords.x][tileCoords.y].entity) {
      const targetEntity = map.tiles[tileCoords.x][tileCoords.y].entity;
      if (targetEntity instanceof Dummy) {
        let damage = 1;
        if (inventory.equippedWeapon) {
          damage = inventory.equippedWeapon.damage;
        }
        console.log(damage);
        targetEntity.health -= damage;
        console.log('HP: ' + targetEntity.health);
        if (targetEntity.health <= 0) {
          console.log('Dummy dead');
          map.tiles[tileCoords.x][tileCoords.y].entity = null;
        }
      }
    }
  }
}
