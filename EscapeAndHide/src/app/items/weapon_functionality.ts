import { Dummy } from '../dummy';
import { GameGrid } from '../grid';

export class WeaponFunctionality {
  map!: GameGrid;
  constructor(map?: GameGrid) {
    if (map) this.map = map;
  }
  attack(tileCoords: { x: number; y: number }) {
    if (this.map.tiles[tileCoords.x][tileCoords.y].entity) {
      const targetEntity = this.map.tiles[tileCoords.x][tileCoords.y].entity;
      if (targetEntity instanceof Dummy) {
        targetEntity.health -= 1;
        console.log('HP: ' + targetEntity.health);
        if (targetEntity.health <= 0) {
          console.log('Dummy dead');
          this.map.tiles[tileCoords.x][tileCoords.y].entity = null;
        }
      }
    }
  }
}
