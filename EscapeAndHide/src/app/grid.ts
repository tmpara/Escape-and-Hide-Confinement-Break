import { tile } from './tile';
import { Entity } from './entity';
import { Wall1, WallCorner1 } from './entities';
import { GameController } from './game.controller';
export class GameGrid {
  width: number;
  height: number;
  tiles: tile[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = new Array();
  }

  createEmptyMap() {
    for (let x = 0; x <= this.width; x++) {
      this.tiles[x] = new Array();
      for(let y=0;y<=this.height;y++){
        this.tiles[x][y] = this.getTileData("empty")
      }
    }
  }

  loadMap(map: Entity[][]) {
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        if (i == 0 || j == 0 || i == map.length - 1 || j == map[i].length - 1) {
          GameController.current?.loadEntity(i, j, new WallCorner1(), this);
        }
        if (map[i][j] != null) {
          GameController.current?.loadEntity(i, j, map[i][j], this);
        }
      }
    }
  }

  createTile(x: number, y: number, name: String, replace: boolean) {
    if (this.isValidTile(x, y) == true) {
      let firevalue = this.tiles[x][y].fireValue;
      let entity = this.tiles[x][y].entity;
      this.tiles[x][y] = this.getTileData(name);
      if (this.tiles[x][y].flammable == true || name == 'ash') {
        this.tiles[x][y].fireValue = firevalue;
      }
      this.tiles[x][y].entity = entity
    }
  }

  isValidTile(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return false;
    } else {
      return true;
    }
  }

  getTileCoords(worldX: number, worldY: number, tileSize: number) {
    const tileX = Math.floor(worldX / tileSize);
    const tileY = Math.floor(worldY / tileSize);
    if (!this.isValidTile(tileX, tileY)) {
      return null;
    }
    return { x: tileX, y: tileY };
  }

  getTileData(name: String) {
    let tileName = '';
    let sprite = '';
    let effect = '';
    let flammable = false;

    switch (name) {
      case 'empty':
        tileName = 'empty';
        sprite = '';
        effect = '';
        flammable = true;
        break;

      case 'ash':
        tileName = 'ash';
        effect = '';
        sprite = '/sprites/tiles/ash.png';
        flammable = false;
        break;
    }

    let info = new tile(tileName, sprite, effect, flammable, 0, null, []);
    return info;
  }

}