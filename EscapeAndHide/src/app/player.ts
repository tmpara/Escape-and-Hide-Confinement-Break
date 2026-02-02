import { Entity } from './entity';
import { Health } from './health/health';
import { Energy } from './energy/energy';

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
  Health = new Health(5000, 5000);
  Energy = new Energy(100, 100);
  renderX = this.posX;
  renderY = this.posY;

  playerAction(energyCost: number) {
    this.Health.updateAfflictions();
    this.Energy.loseEnergy(energyCost);
    this.Health.bleedingRegen();
  }
}
