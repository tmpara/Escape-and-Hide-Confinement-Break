import * as PIXI from 'pixi.js';
import { entity } from './entity';
import { Health } from './health/health';

export class Player extends entity{
  
  PosX: number;
  PosY: number;
  renderX: number;
  renderY: number;
  id: string;
  health: Health;

  constructor( PosX: number, PosY: number, id: string, health: Health){ 
    super();
    this.id = id;
    this.PosX = PosX;
    this.PosY = PosY;
    this.renderX = PosX;
    this.renderY = PosY;
    this.health = health;
  }

 
}
