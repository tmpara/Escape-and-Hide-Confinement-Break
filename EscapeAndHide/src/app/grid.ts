import { Item } from './inventory/item';
import { Player } from './player';
import { Tile } from './Tile';
export class GameGrid {
  width: number;
  height: number;
  Tiles: Tile[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.Tiles = new Array();
  }

  CreateEmptyMap() {
    for (let x = 0; x <= this.width; x++) {
      this.Tiles[x] = new Array();
      for (let y = 0; y <= this.height; y++) {
        this.Tiles[x][y] = new Tile(false, false, null, '', false, null, null);
      }
    }
  }

  CreateMap() {}

  CreatePlayer(x: number, y: number, id: string) {
    this.Tiles[x][y].entity = new Player(x, y, id);
  }

  LoadPlayer(x: number, y: number, player: Player) {
    this.Tiles[x][y].entity = player;
  }

  SpawnItem(x: number, y: number, item: Item) {
    this.Tiles[x][y].hasItem = true;
    this.Tiles[x][y].item = item;
  }
  RemoveItem(x: number, y: number) {
    this.Tiles[x][y].hasItem = false;
    this.Tiles[x][y].item = null;
  }
}
