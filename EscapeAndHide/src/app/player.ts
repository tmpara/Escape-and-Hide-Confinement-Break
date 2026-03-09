import { Entity } from './entity';
import { Health } from './health/health';
import { Energy } from './energy/energy';
import { GameController } from './game.controller';
import { Genetics } from './health/genetics';

export class Player extends Entity {
  override name = '';
  override sprite = '';
  override collidable = false;
  override damageable = false;
  override hiddenOutsideLOS = false;
  override blockLOS = false;
  override flammable = true;
  enableAnimating = true;
  playerId = 0;
  override Health = new Health(5000, 5000);
  Energy = new Energy(100, 100);
  renderX = this.posX;
  renderY = this.posY;
  factionID = 1;

  playerAction(energyCost: number) {
    this.Energy.loseEnergy(energyCost);
    this.Health.bleedingRegen();
  }
}
