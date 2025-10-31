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
        this.tiles[x][y] = new tile("empty",false,"",false,null,true,0,null,"",null);
      }
    }
  }
  
  

  loadMap(map: string[][]){
    for(let i=0;i<map.length;i++){
      for(let j=0;j<map[i].length;j++){
        if(i==0 || j==0 || i==map.length-1 || j==map[i].length-1){
          this.tiles[i][j] = this.getTileData("wall_corner")
        }
        
        if(map[i][j] != "floor_basic"){
          this.tiles[i][j] = this.getTileData(map[i][j])
        }
        
    }
  }


  }
  
  getTileData(name: String){

    let info = new tile("empty",false,"",false,null,true,0,null,"",null);

    switch (name){

    
    case 'glass_shards':
      info = new tile("glass_shards",false,"glass_shards",true,5,true,0,null,"placeholder.png",null);
      return info
    
    case 'wall_corner':
      info = new tile("wall_corner",true,"",false,null,false,0,null,"placeholder.png",null);
      return info

    case 'wall_basic':
      info = new tile("wall_basic",true,"",true,100,true,0,null,"placeholder.png",null);
      return info
      
    case 'ash':
      info = new tile("ash",false,"",false,null,false,0,null,"ash.png",null);
      return info

    case 'room_entrance':
      info = new tile("door",false,"entrance",false,null,false,0,null,"door1.png",null);
      return info
      
    }
    return info;
  }

  createTile(x: number, y: number, name: String, replace: boolean){
    if (this.isValidTile(x,y)==true){
      let firevalue = this.tiles[x][y].fireValue
      this.tiles[x][y] = this.getTileData(name)
      if (this.tiles[x][y].flammable==true || name=="ash"){
        this.tiles[x][y].fireValue = firevalue
      }
    }
  }

  clearTile(x: number, y: number){
    if (this.isValidTile(x,y)){
      this.tiles[x][y] = new tile("empty",false,"",false,null,true,0,null,"",null);
    }
  }

  isValidTile(x: number, y: number){
    if (x < 0 || y < 0 || x >= this.width || y >= this.height){
      return false
    }else{
      return true
    }
  }

  damageTile(x:number,y:number,damage:number){
    if (this.tiles[x][y].health!=null && this.tiles[x][y].destroyable==true){
      this.tiles[x][y].health = this.tiles[x][y].health! - damage;
      if (this.tiles[x][y].health<=0){
        this.destroyTile(x,y)
      }
    }
  }

  destroyTile(x:number,y:number){
    if (this.tiles[x][y].brokenTile==null && this.tiles[x][y].fireValue>0){
      this.createTile(x,y,"ash",true);
    }
    else if (this.tiles[x][y].brokenTile!=null){
      this.createTile(x,y,this.tiles[x][y].brokenTile,true);
    }
    else{
      this.clearTile(x,y)
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
