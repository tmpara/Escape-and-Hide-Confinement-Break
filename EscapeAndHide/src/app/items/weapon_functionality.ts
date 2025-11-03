import { Dummy } from '../dummy';
import { GameGrid } from '../grid';

export class WeaponFunctionality {
  
  attack(tileCoords: { x: number; y: number;}, map: GameGrid ) {
    if (map.tiles[tileCoords.x][tileCoords.y].entity) {
      const targetEntity = map.tiles[tileCoords.x][tileCoords.y].entity;
      if (targetEntity instanceof Dummy) {
        targetEntity.health -= 1;
        console.log('HP: ' + targetEntity.health);
        if (targetEntity.health <= 0) {
          console.log('Dummy dead');
          map.tiles[tileCoords.x][tileCoords.y].entity = null;
        }
      }
    }
  }
}
