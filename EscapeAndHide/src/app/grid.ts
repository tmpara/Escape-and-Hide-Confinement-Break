import { Health } from "./health/health";
import { Energy } from "./energy/energy";
import { Player } from "./player";
import { tile } from "./tile";
import * as PIXI from 'pixi.js';
export class GameGrid {
  width: number;
  height: number;
  tiles:tile[][];
  emptyTile: tile;
  constructor(width: number, height: number) {
    
    this.width = width;
    this.height = height;
    this.tiles = new Array();
    this.emptyTile = new tile(false,"",false,null,"",null);

  }

  CreateEmptyMap(){
    for(let x=0;x<=this.width;x++){
      this.tiles[x] = new Array();
      for(let y=0;y<=this.height;y++){
        this.tiles[x][y] = new tile(false,"",false,null,"",null);
      }
    }
  }
  
  CreateMap(){
    this.tiles[4][1] = this.getTileData("wall_basic")
    this.tiles[4][2] = this.getTileData("wall_basic")
    this.tiles[4][3] = this.getTileData("wall_basic")
    this.tiles[4][4] = this.getTileData("wall_basic")
    this.tiles[4][5] = this.getTileData("wall_basic")
    this.tiles[4][6] = this.getTileData("wall_basic")
    this.tiles[4][7] = this.getTileData("wall_basic")
    this.tiles[4][8] = this.getTileData("wall_basic")
    this.tiles[4][9] = this.getTileData("wall_basic")
    this.tiles[4][10] = this.getTileData("wall_basic")
    this.tiles[4][11] = this.getTileData("wall_basic")
    this.tiles[4][12] = this.getTileData("wall_basic")
    this.tiles[1][6] = this.getTileData("room_entrance")
  }

  LoadMap(x:number,y:number,map: string[][]){
    for(let i=0;i<map.length;i++){
      for(let j=0;j<map[i].length;j++){
        if(this.emptyTile == this.getTileData(map[i][j])){
          
        }else{
          this.tiles[i][j] = this.getTileData(map[i][j])
        }
        
    }
  }


  }
  
  getTileData(name: String){

    let info = new tile(false,"",false,100,"",null);

    
    switch (name){

    
    case 'glass_shards':
      info = new tile(false,"glass_shards",true,5,"placeholder.png",null);
      return info
      
    case 'wall_basic':
      info = new tile(true,"",true,100,'placeholder.png',null);
      return info

    case 'room_entrance':
      info = new tile(false,"entrance",false,null,"door1.png",null);
      return info
      
    }
    return info

  }

  addTileEffect(x:number,y:number,effect:string){
    this.tiles[x][y].effect = effect;
  }

  CreatePlayer(x: number, y:number, id:string){
    this.tiles[x][y].entity = new Player(x,y,id, new Health(5.00, 5.00), new Energy(100,100));
  }

  LoadPlayer(x: number, y:number, player: Player){
    this.tiles[x][y].entity = player;
  }

}
