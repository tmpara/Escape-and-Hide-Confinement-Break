import { Health } from './health/health';
import { Energy } from './energy/energy';
import { Player } from './player';
import { tile } from './tile';
import { Item } from './items/item';
import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
import { Dummy, HeavyDummy } from './enemyTypes';
import { Entity } from './entity';
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

  createTile(x: number, y: number, name: String, replace: boolean){
    if (this.isValidTile(x,y)==true){
      let firevalue = this.tiles[x][y].fireValue
      let entity = this.tiles[x][y].entity
      this.tiles[x][y] = this.getTileData(name)
      if (this.tiles[x][y].flammable==true || name=="ash"){
        this.tiles[x][y].fireValue = firevalue
        
      }
      this.tiles[x][y].entity = entity
    }
  }

  clearTile(x: number, y: number){
    if (this.isValidTile(x,y)){
      this.tiles[x][y] = this.getTileData("empty")
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

  loadPlayer(x: number, y: number, player: Player) {

  }

  loadEnemy(x: number, y: number, entity: any) {
    this.tiles[x][y].entity = entity;
  }

  SpawnItem(x: number, y: number, item: Item) {
    this.tiles[x][y].item = item;
  }

  RemoveItem(x: number, y: number, effect?: string) {
    this.tiles[x][y].item = null;
  }

  getTileData(name: String){

    let tileName = ""
    let flammable = false
    let sprite = ""

    switch (name){

    case 'empty':
      tileName="door"
      sprite=""
      flammable=true
      break;
    
    case 'wall_corner':
      tileName="corner wall"
      sprite="placeholder.png"
      flammable=false
      break;

    case 'wall_basic':
      tileName="basic wall"
      sprite="placeholder.png"
      flammable=true
      break;
      
    case 'ash':
      tileName="ash"
      sprite="ash.png"
      flammable=false
      break;

    case 'room_entrance':
      tileName="door"
      sprite="door1.png"
      flammable=false
      break;  
    }

    let info = new tile(tileName,sprite,flammable,0,null,null);
    return info;
  }

}
