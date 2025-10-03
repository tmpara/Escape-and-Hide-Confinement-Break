import { Health } from "./health/health";
import { Energy } from "./energy/energy";
import { Player } from "./player";
import { tile } from "./tile";
import { glass_shards } from "./glass_shards";
export class GameGrid {
  width: number;
  height: number;
  tiles:tile[][];

  constructor(width: number, height: number) {
    
    this.width = width;
    this.height = height;
    this.tiles = new Array();

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
    this.tiles[2][2].entity = new glass_shards
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
