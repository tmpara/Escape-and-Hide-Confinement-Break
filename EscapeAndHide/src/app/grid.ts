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

  createEmptyMap(){
    for(let x=0;x<=this.width;x++){
      this.tiles[x] = new Array();
      for(let y=0;y<=this.height;y++){
        this.tiles[x][y] = new tile(null,false,"",false,null,true,"",null);
      }
    }
  }
  
  createMap(){
  }
  
  getTileData(name: String){

    let info = new tile(null,false,"",false,null,true,"",null);

    
    switch (name){
    case 'glass_shards':
      info = new tile("glass_shards",false,"glass_shards",true,5,true,"placeholder.png",null);
      return info
      break;
    case 'wall_basic':
      info = new tile("wall_basic",true,"",true,100,false,"placeholder.png",null);
      return info
      break;
    case 'fire':
      info = new tile("fire",false,"fire",false,100,false,"fire.png",null);
      return info
      break;
    case 'ash':
      info = new tile("ash",false,"",false,null,false,"ash.png",null);
      return info
      break;
    case 'explosion':
      info = new tile("explosion",false,"explosion",false,3,false,"explosion.png",null);
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
      this.tiles[x][y] = new tile(null,false,"",false,null,true,"",null);
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
}
