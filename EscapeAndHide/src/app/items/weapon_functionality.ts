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
      if (targetEntity instanceof Dummy && !targetEntity.isDead) {
        let damage = 1;
        if (inventory.equippedWeapon) {
          damage = inventory.equippedWeapon.damage;
        }
        console.log(damage);
        targetEntity.health -= damage;
        console.log('HP: ' + targetEntity.health);
        if (targetEntity.health <= 0) {
          targetEntity.isDead = true;
          map.tiles[tileCoords.x][tileCoords.y].corpseSprite = 'enemy1dead.png';
          console.log('Target is dead.');
        }
      }
    }
  }

  isDead(tileCoords: { x: number; y: number }, map: GameGrid){
    const entity = map.tiles[tileCoords.x][tileCoords.y].entity;
    if (entity instanceof Dummy) {
      return entity.isDead;
    }
    return;
  }  
}
