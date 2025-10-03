import * as PIXI from 'pixi.js';
import { entity } from './entity';
import { Health } from './health/health';
import { Energy } from './energy/energy';


export class Player extends entity{
  
  PosX: number;
  PosY: number;
  renderX: number;
  renderY: number;
  id: string;
  health: Health;
  energy: Energy;

  constructor( PosX: number, PosY: number, id: string, health: Health, energy: Energy){ 
    super();
    this.id = id;
    this.PosX = PosX;
    this.PosY = PosY;
    this.health = health;
    this.energy = energy;
  }

  playerAction(energyCost: number){

    this.health.TriggerDot();
    this.energy.loseEnergy(energyCost);

  }

}
