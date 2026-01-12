import * as PIXI from 'pixi.js';
import { Entity } from './entity';
import { Health } from './health/health';
import { Energy } from './energy/energy';
import { GlassShards } from './entities';
import { GameController } from './game.controller';

export class Player extends Entity {
  override name = '';
  override sprite = '';
  override posX = 0;
  override posY = 0;
  override collidable = false;
  override damageable = false;
  override hiddenOutsideLOS = false;
  override blockLOS = false;
  override flammable = true;
  enableAnimating = true;
  playerId = 0;
  renderX = 0;
  renderY = 0;
  Health = new Health(5000, 5000);
  Energy = new Energy(100, 100);

  playerAction(energyCost: number) {
    this.Health.updateAfflictions();
    this.Energy.loseEnergy(energyCost);
    this.Health.bleedingRegen();
    this.checkBeneathForGlassShard();
  }

  checkBeneathForGlassShard() {
    const grid = GameController.current?.map;
    if (grid) {
      const tile = grid.tiles[this.posX]?.[this.posY];
      if (tile) {
        if (tile.entity[0] instanceof GlassShards) {
          this.Health.damageLimb('leftLeg', [
            ['Lacerations', 15],
            ['Bleeding', 20],
          ]);
          this.Health.damageLimb('rightLeg', [
            ['Lacerations', 15],
            ['Bleeding', 20],
          ]);
        }
      }
    }
  }
}
