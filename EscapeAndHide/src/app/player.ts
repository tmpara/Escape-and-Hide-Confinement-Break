import * as PIXI from 'pixi.js';
import { entity } from './entity';
import { Health } from './health/health';

export class Player extends entity{
  
  PosX: number;
  PosY: number;
  id: string;
  health: Health;

  constructor( PosX: number, PosY: number, id: string,health: Health){ 
    super();
    this.id = id;
    this.PosX = PosX 
    this.PosY = PosY
    this.health = health;
  }

 
}
