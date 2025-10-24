import { Health } from './health/health';
import { Energy } from './energy/energy';
import { Player } from './player';
import { tile } from './tile';
import { Item } from './inventory/item';
import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
export class GameGrid {
  width: number;
  height: number;
  tiles: tile[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = new Array();
  }

  createEmptyMap(){
    for(let x=0;x<=this.width;x++){
      this.tiles[x] = new Array();
      for(let y=0;y<=this.height;y++){
        this.tiles[x][y] = new tile(false,"", false, null, false,null,true,"",null);
      }
    }
  }
  
  createMap(){
    this.tiles[12][12] = this.getTileData("fire")

    this.tiles[10][1] = this.getTileData("wall_basic")
    this.tiles[10][2] = this.getTileData("wall_basic")
    this.tiles[10][3] = this.getTileData("wall_basic")
    this.tiles[10][4] = this.getTileData("wall_basic")
    this.tiles[10][5] = this.getTileData("wall_basic")
    this.tiles[10][6] = this.getTileData("wall_basic")
    this.tiles[10][7] = this.getTileData("wall_basic")
    this.tiles[10][8] = this.getTileData("wall_basic")
    this.tiles[10][9] = this.getTileData("wall_basic")
    this.tiles[10][10] = this.getTileData("wall_basic")
    this.tiles[10][11] = this.getTileData("wall_basic")
    this.tiles[10][12] = this.getTileData("wall_basic")
    this.tiles[10][13] = this.getTileData("wall_basic")
    this.tiles[10][14] = this.getTileData("wall_basic")
    this.tiles[10][15] = this.getTileData("wall_basic")
    this.tiles[10][16] = this.getTileData("wall_basic")
    this.tiles[10][17] = this.getTileData("wall_basic")
    this.tiles[10][18] = this.getTileData("wall_basic")
    this.tiles[10][19] = this.getTileData("wall_basic")
    this.tiles[10][20] = this.getTileData("wall_basic")
    this.tiles[10][21] = this.getTileData("wall_basic")
    this.tiles[10][22] = this.getTileData("wall_basic")
    this.tiles[10][23] = this.getTileData("wall_basic")
    this.tiles[10][24] = this.getTileData("wall_basic")
    this.tiles[10][25] = this.getTileData("wall_basic")
    this.tiles[10][26] = this.getTileData("wall_basic")

    this.tiles[14][1] = this.getTileData("wall_basic")
    this.tiles[14][2] = this.getTileData("wall_basic")
    this.tiles[14][3] = this.getTileData("wall_basic")
    this.tiles[14][4] = this.getTileData("wall_basic")
    this.tiles[14][5] = this.getTileData("wall_basic")
    this.tiles[14][6] = this.getTileData("wall_basic")
    this.tiles[14][7] = this.getTileData("wall_basic")
    this.tiles[14][8] = this.getTileData("wall_basic")
    this.tiles[14][9] = this.getTileData("wall_basic")
    this.tiles[14][10] = this.getTileData("wall_basic")
    this.tiles[14][11] = this.getTileData("wall_basic")
    this.tiles[14][12] = this.getTileData("wall_basic")
    this.tiles[14][13] = this.getTileData("wall_basic")
    this.tiles[14][14] = this.getTileData("wall_basic")
    this.tiles[14][15] = this.getTileData("wall_basic")
    this.tiles[14][16] = this.getTileData("wall_basic")
    this.tiles[14][17] = this.getTileData("wall_basic")
    this.tiles[14][18] = this.getTileData("wall_basic")
    this.tiles[14][19] = this.getTileData("wall_basic")
    this.tiles[14][20] = this.getTileData("wall_basic")
    this.tiles[14][21] = this.getTileData("wall_basic")
    this.tiles[14][22] = this.getTileData("wall_basic")
    this.tiles[14][23] = this.getTileData("wall_basic")
    this.tiles[14][24] = this.getTileData("wall_basic")
    this.tiles[14][25] = this.getTileData("wall_basic")
    this.tiles[14][26] = this.getTileData("wall_basic")
  }
  
  getTileData(name: String){

    let info = new tile(false,"",false, null, false,null,true,"",null);

    
    switch (name){
    case 'glass_shards':
      info = new tile(false,"glass_shards", false, null, true,5,true,"placeholder.png",null);
      return info
      break;
    case 'wall_basic':
      info = new tile(true,"", false, null, true,100,false,"placeholder.png",null);
      return info
      break;
    case 'fire':
      info = new tile(false,"fire", false, null, false,100,false,"fire.png",null);
      return info
      break;
    case 'ash':
      info = new tile(false,"",false, null, false,null,false,"ash.png",null);
      return info
      break;
    }
    return info;
  }

  createTile(x: number, y: number, name: String, replace: boolean){
    if (this.isValidTile(x,y)==true){
      this.tiles[x][y] = this.getTileData(name)
    }
  }

  clearTile(x: number, y: number){
    if (this.isValidTile(x,y)){
      this.tiles[x][y] = new tile(false,"",false, null, false,null,true,"",null);
    }
  }

  isValidTile(x: number, y: number){
    if (x < 0 || y < 0 || x >= this.width || y >= this.height){
      return false
    }else{
      return true
    }
  }

  addTileEffect(x:number,y:number,effect:string){
    this.tiles[x][y].effect = effect;
  }

  createPlayer(x: number, y:number, id:string){
    this.tiles[x][y].entity = new Player(x,y,id, new Health(5.00, 5.00), new Energy(100,100));
  }

  loadPlayer(x: number, y:number, player: Player){
    this.tiles[x][y].entity = player;
  }

  SpawnItem(x: number, y: number, item: Item) {
    this.tiles[x][y].hasItem = true;
    this.tiles[x][y].item = item;
    this.tiles[x][y].sprite = item.sprite;
  }
  RemoveItem(x: number, y: number, effect?: string) {
    let spriteAfterRemoval = "";
    switch (effect) {
      case "fire":
        spriteAfterRemoval = "fire.png";
        this.tiles[x][y].effect = "fire";
        break;
      case "glass_shards":
        spriteAfterRemoval = "placeholder.png";
        this.tiles[x][y].effect = "glass_shards";
        break;  
    }    
    this.tiles[x][y].sprite = spriteAfterRemoval;
    this.tiles[x][y].hasItem = false;
    this.tiles[x][y].item = null;
  }
}
