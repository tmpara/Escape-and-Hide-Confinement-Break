import { Health } from './health/health';
import { Energy } from './energy/energy';
import { Player } from './player';
import { tile } from './tile';
import { Item } from './inventory/item';
import * as PIXI from 'pixi.js';
export class GameGrid {
  width: number;
  height: number;
  tiles: tile[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = new Array();
  }

  CreateEmptyMap() {
    for (let x = 0; x <= this.width; x++) {
      this.tiles[x] = new Array();
      for (let y = 0; y <= this.height; y++) {
        this.tiles[x][y] = new tile(false, '', false, null, '', null);
      }
    }
  }

  CreateMap() {
    this.tiles[2][2] = this.getTileData('glass_shards');
    this.tiles[4][1] = this.getTileData('wall_basic');
    this.tiles[4][2] = this.getTileData('wall_basic');
    this.tiles[4][3] = this.getTileData('wall_basic');
    this.tiles[4][4] = this.getTileData('wall_basic');
    this.tiles[4][5] = this.getTileData('wall_basic');
    this.tiles[4][6] = this.getTileData('wall_basic');
    this.tiles[4][7] = this.getTileData('wall_basic');
    this.tiles[4][8] = this.getTileData('wall_basic');
    this.tiles[4][9] = this.getTileData('wall_basic');
    this.tiles[4][10] = this.getTileData('wall_basic');
    this.tiles[4][11] = this.getTileData('wall_basic');
    this.tiles[4][12] = this.getTileData('wall_basic');
  }

  getTileData(name: String) {
    let info = new tile(false, '', false, 100, '', null);

    switch (name) {
      case 'glass_shards':
        info = new tile(
          false,
          'glass_shards',
          true,
          5,
          'placeholder.png',
          null
        );
        return info;
        break;
      case 'wall_basic':
        info = new tile(
          true,
          '',
          true,
          100,
          'https://art.pixilart.com/sr24d0c9ad1eded.png',
          null
        );
        return info;
        break;
    }
    return info;
  }

  addTileEffect(x: number, y: number, effect: string) {
    this.tiles[x][y].effect = effect;
  }

  CreatePlayer(x: number, y: number, id: string) {
    this.tiles[x][y].entity = new Player(
      x,
      y,
      id,
      new Health(5.0, 5.0),
      new Energy(100, 100)
    );
  }

  LoadPlayer(x: number, y: number, player: Player) {
    this.tiles[x][y].entity = player;
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
