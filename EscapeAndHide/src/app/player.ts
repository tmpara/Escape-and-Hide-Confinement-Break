import * as PIXI from 'pixi.js';
import { Entity } from './entity';
import { Health } from './health/health';
import { Energy } from './energy/energy';

export class Player extends Entity {
  override name = "";
  override sprite = "";
  override collidable = false;
  override damageable = false;
  override health = 0;
  override hiddenOutsideLOS = false
  override blockLOS = false;
  override flammable = true;
  playerId = 0;
  renderX = this.posX;
  renderY = this.posY;
  Health = new Health(5,5);
  Energy = new Energy(100,100);

  playerAction(energyCost: number) {
    this.Health.TriggerDot();
    this.Energy.loseEnergy(energyCost);
  }
  
}
