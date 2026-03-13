import { Entity } from '../entity';
import { GameController } from '../game.controller';
import { affliction, LimbName } from '../health/health';

export abstract class Item {
  name = '';
  category = '';
  sprite = 'placeholder.png';
  structureDamage = 1;
  accuracy = 1;
  range = 1;
  afflictions: (string | number)[][] = [[' ', 0]]; // [[afflictionType, amount]]
  defense = 0;
  slot = '';

  use(target: Entity) {}

  checkForMiss(target: Entity) {
    const roll = Math.random();
    if (roll > this.accuracy) return null;
    
    if (!target.Health) return 'isStructure';

    const limbRoll = Math.random();
    if (limbRoll > this.accuracy * 2) {
      const limbs: LimbName[] = [
        'head',
        'leftArm',
        'rightArm',
        'leftLeg',
        'rightLeg',
      ];
      const randomIndex = Math.floor(Math.random() * limbs.length);
      return limbs[randomIndex];
    }
    return 'torso';
  }

  getStats() {
    switch (this.category) {
      case 'weapon':
        return {
          name: 'Name: ' + this.name,
          afflictions: this.afflictions,
          structureDamage: 'Structure damage: ' + this.structureDamage,
          accuracy: 'Accuracy: ' + this.accuracy,
          range: 'Range: ' + this.range,
        };
      case 'armor':
        return {
          name: 'Name: ' + this.name,
          defense: 'Defense: ' + this.defense,
        };

      case 'usable_heal':
        return {
          name: 'Name: ' + this.name,
          afflictions: this.afflictions,
        };
      default:
        return;
    }
  }
}
export class SmallGun extends Item {
  override name = 'gun';
  override category = 'weapon';
  override sprite = '/sprites/items/gun.png';
  override structureDamage = 50;
  override accuracy = 0.8;
  override afflictions = [
    ['GunshotWound', 15],
    ['Bleeding', 30],
  ];
  override range = 7;
  override slot = 'weapon';

  override use(target: Entity) {
    debugger
    const targetLimb = this.checkForMiss(target);
    if (targetLimb == 'isStructure') {
      target.takeStructureDamage(this.structureDamage);
    } else if (targetLimb) {
      let afflictions: affliction[] = [];
      for (const affliction of this.afflictions) {
          afflictions.push([affliction[0] as string, affliction[1] as number]);
      }
      if (target.Health) {
        target.Health.damageLimb(targetLimb as LimbName, afflictions);
        if(target.Health.currentHealth <= 0) {
          target.destroy();
        }
      }
    }
  }
}
export class BigGun extends Item {
  override name = 'bigGun';
  override category = 'weapon';
  override sprite = '/sprites/items/biggun.png';
  override structureDamage = 100;
  override accuracy = 0.7;
  override afflictions = [
    ['GunshotWound', 30],
    ['Bleeding', 50],
  ];
  override range = 12;
  override slot = 'weapon';
  burst = 3;

  override use(target: Entity) {
    for (let i = 0; i < this.burst; i++) {
      const targetLimb = this.checkForMiss(target);
      if (targetLimb == 'isStructure') {
        target.takeStructureDamage(this.structureDamage);
      } else if (targetLimb) {
        let afflictions: affliction[] = [];
        for (const affliction of this.afflictions) {
          if (Array.isArray(affliction) && affliction.length >= 2) {
            afflictions.push([affliction[0] as string, affliction[1] as number]);
          }
        }
        if (target.Health) {
          target.Health.damageLimb(targetLimb as LimbName, afflictions);
          if(target.Health.currentHealth <= 0) {
            target.destroy();
          }
        }
      }
    }
  }
}
export class Flamethrower extends Item {
  override name = 'flamethrower';
  override category = 'weapon';
  override sprite = '/sprites/items/flamethrower.png';
  override structureDamage = 10;
  override range = 7;
  override slot = 'weapon';
  override afflictions = [['Burn', 10]];

  override use(target: Entity) {
    const controller = GameController.current;
    if (!controller) return;
    
    const player = controller.player1;
    if (!player) return;

    const firingAngle = Math.atan2(target.posY - player.posY, target.posX - player.posX);
    
    const coneTiles = controller.getTilesInCone(
      player.posX,
      player.posY,
      this.range,
      firingAngle,
      Math.PI / 3,
    );

    for (const [x, y] of coneTiles) {
      const entities = controller.getAllEntitiesOnTile(x, y);
      let tileRange = Math.max(
        Math.abs(x - player.posX),
        Math.abs(y - player.posY),
      );
      let fireChance = controller.generateRandomNumber(1, tileRange);
      
      if (fireChance <= 2) {
        controller.ignite(x, y, this.structureDamage - tileRange * 2, true, true);
      }

      for (const entity of entities) {
        if (entity !== player) {
          if (entity.Health) {
            let afflictions: affliction[] = [];
            for (const affliction of this.afflictions) {
              if (Array.isArray(affliction) && affliction.length >= 2) {
                afflictions.push([affliction[0] as string, affliction[1] as number]);
              }
            }
            entity.Health.damageLimb('torso', afflictions);
          }
        }
      }
    }
  }
}
export class StunGun extends Item {
  override name = 'stunGun';
  override category = 'weapon';
  override sprite = '/sprites/items/placeholder.png';
  override structureDamage = 1;
  override range = 5;
  override accuracy = 0.65;
  override slot = 'weapon';
  override afflictions = [
    ['Zapped', 10],
    ['Lacerations', 2],
    ['Bleeding', 2],
  ];

  override use(target: Entity) {

    const targetLimb = this.checkForMiss(target);
    if (targetLimb == 'isStructure') {
      target.takeStructureDamage(this.structureDamage);
    } else if (targetLimb) {
      let afflictions: affliction[] = [];
      for (const affliction of this.afflictions) {
          afflictions.push([affliction[0] as string, affliction[1] as number]);
      }
      if (target.Health) {
        target.Health.damageLimb(targetLimb as LimbName, afflictions);
        if(target.Health.currentHealth <= 0) {
          target.destroy();
        }
      }
    }
  }
}
export class Bandage extends Item {
  override name = 'bandage';
  override category = 'usable_heal';
  override sprite = '/sprites/items/bandage.png';
  override afflictions = [
    ['Lacerations', 20],
    ['Bleeding', 20],
  ];

  override use(target: Entity) {
    if (target.Health) {
      let afflictions: affliction[] = [];
      for (let affliction of this.afflictions) {
        if (Array.isArray(affliction) && affliction.length >= 2) {
          afflictions.push([affliction[0] as string, affliction[1] as number]);
        }
      }
      target.Health.healLimb(afflictions);
    }
    GameController.current?.removeItemFromInventory(this);
  }
}
export class Medkit extends Item {
  override name = 'medkit';
  override category = 'usable_heal';
  override sprite = '/sprites/items/medkit.png';
  override afflictions: (any | null)[][] = [
    ['Lacerations', 50],
    ['Bleeding', 50],
  ];

  override use(target: Entity) {
    if (target.Health) {
      let afflictions: affliction[] = [];
      for (let affliction of this.afflictions) {
        if (Array.isArray(affliction) && affliction.length >= 2) {
          afflictions.push([affliction[0] as string, affliction[1] as number]);
        }
      }
      target.Health.healLimb(afflictions);
    }
    GameController.current?.removeItemFromInventory(this);
  }
}
export class Helmet extends Item {
  override name = 'helmet';
  override category = 'armor';
  override sprite = '/sprites/items/helmet.png';
  override defense = 10;
  override slot = 'head';
}
export class Vest extends Item {
  override name = 'vest';
  override category = 'armor';
  override sprite = '/sprites/items/vest.png';
  override defense = 20;
  override slot = 'torso';
}
