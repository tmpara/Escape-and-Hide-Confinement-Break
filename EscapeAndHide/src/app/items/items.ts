import { Entity } from '../entity';
import { GameController } from '../game.controller';
import { Player } from '../player';

export abstract class Item {
  name = '';
  category = '';
  displayed = false;
  sprite = 'placeholder.png';
  isEquipped = false;
  damage = 0;
  range = 0;
  healAfflictions = [ [null, 0] ]; // [afflictionType, amount][]
  defense = 0;
  slot = '';

  dealDamage(target: Entity) {
    target.takeDamage(this.damage, 'laceration');
  }

  heal(target: Entity) {
    target.heal(0);
  }
}

export class gun extends Item {
  override name = 'gun';
  override category = 'weapon';
  override displayed = false;
  override sprite = '/sprites/items/gun.png';
  override damage = 50;
  override range = 25;
  override slot = 'weapon';

  override dealDamage(target: Entity) {
    if (target.damageable) target.takeDamage(this.damage, 'gunshot');
  }
}
export class bigGun extends Item {
  override name = 'bigGun';
  override category = 'weapon';
  override displayed = false;
  override sprite = '/sprites/items/biggun.png';
  override damage = 100;
  override range = 7;
  override slot = 'weapon';

  override dealDamage(target: Entity) {
    if (target.damageable) target.takeDamage(this.damage, 'gunshot');
  }
}
export class bandage extends Item {
  override name = 'bandage';
  override category = 'consumable_heal';
  override displayed = false;
  override sprite = '/sprites/items/bandage.png';
  override healAfflictions: (any | null)[][] = [ ['Lacerations', 20], ['Bleeding', 20] ];

  override heal(target: Entity) {
    if(target.Health){
      for (let affliction of this.healAfflictions) {
        if (affliction[0] === 'Lacerations') {
          target.Health.healLimb([affliction[0], affliction[1]]);
        }
        if (affliction[0] === 'Bleeding') {
          target.Health.healLimb([affliction[0], affliction[1]]);
        }
      }
    }
  }
}
export class medkit extends Item {
  override name = 'medkit';
  override category = 'consumable_heal';
  override displayed = false;
  override sprite = '/sprites/items/medkit.png';
  override healAfflictions: (any | null)[][] = [ ['Lacerations', 50], ['Bleeding', 50] ];

  override heal(target: Entity) {
    if(target.Health){
      for (let affliction of this.healAfflictions) {
        if (affliction[0] === 'Lacerations') {
          target.Health.healLimb([affliction[0], affliction[1]]);
        }
        if (affliction[0] === 'Bleeding') {
          target.Health.healLimb([affliction[0], affliction[1]]);
        }
      }
    }
  }
}
export class helmet extends Item {
  override name = 'helmet';
  override category = 'armor';
  override displayed = false;
  override sprite = '/sprites/items/helmet.png';
  override defense = 10;
  override slot = 'head';
}
export class vest extends Item {
  override name = 'vest';
  override category = 'armor';
  override displayed = false;
  override sprite = '/sprites/items/vest.png';
  override defense = 20;
  override slot = 'torso';
}
