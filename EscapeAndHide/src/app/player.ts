import { Entity } from './entity';
import { Health } from './health/health';
import { Energy } from './energy/energy';
import { GameController } from './game.controller';
import { Genetics } from './health/genetics';
import { SmallGun } from './items/items';

export class Player extends Entity {
  gameController = GameController;
  override name = 'Player';
  override sprite = '/sprites/entities/player.png';
  override collidable = false;
  override damageable = false;
  override hiddenOutsideLOS = false;
  override blockLOS = false;
  override flammable = true;
  override Health = new Health(100, 100);
  Energy = new Energy(100, 100);
  enableAnimating = true;
  playerId = 0;

  renderX = this.posX;
  renderY = this.posY;
  factionID = 1;

  constructor(){
    super();
    this.Health.setPlayerReference(this);
  }

  playerAction(energyCost: number) {
    this.Energy.loseEnergy(energyCost);
    this.Health.updateAfflictions();
  }
}
