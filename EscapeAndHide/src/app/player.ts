import * as PIXI from 'pixi.js';
import { Entity } from './entity';
import { Health } from './health/health';
import { Energy } from './energy/energy';

export type playerConfig = {
  id: number,
  name?: string,
  sprite?: string,
  posX?: number,
  posY?: number,
  collidable?: boolean,
  damageable?: boolean,
  health?: number,
}

export class Player extends Entity {
  id: number;
  renderX: number;
  renderY: number;
  Health: Health;
  Energy: Energy;
  constructor(t:playerConfig) 
  {
    const {id
      ,name
      ,sprite
      ,posX
      ,posY
      ,collidable
      ,damageable
      ,health}=t
    super(name ?? "Player", sprite ?? "placeholder.png", posX ?? 0, posY ?? 0, collidable ?? false, damageable ?? false, health ?? 100);
    this.id = id;
    this.renderX = 0;
    this.renderY = 0;
    this.Health = new Health(5,5);
    this.Energy = new Energy(100,100);
  }

  playerAction(energyCost: number) {
    this.Health.TriggerDot();
    this.Energy.loseEnergy(energyCost);
  }

}
