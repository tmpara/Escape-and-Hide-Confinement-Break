import { Entity } from '../entity';

export abstract class Item {
  name = '';
  category = '';
  displayed = false;
  sprite = 'placeholder.png';
  isEquipped = false;
  damage = 1;
  range = 1;
  afflictions: (string | number)[][] = [[' ', 0]]; // [afflictionType, amount][]
  defense = 0;
  slot = '';

  heal(target: Entity) {
    target.heal(0);
  }
}

export class SmallGun extends Item {
  override name = 'gun';
  override category = 'weapon';
  override displayed = false;
  override sprite = '/sprites/items/gun.png';
  override damage = 50;
  override afflictions = [
    ['Gunshot', 15],
    ['Bleeding', 30],
  ];
  override range = 25;
  override slot = 'weapon';
}
export class BigGun extends Item {
  override name = 'bigGun';
  override category = 'weapon';
  override displayed = false;
  override sprite = '/sprites/items/biggun.png';
  override afflictions = [
    ['Gunshot', 30],
    ['Bleeding', 50],
  ];
  override damage = 100;
  override range = 7;
  override slot = 'weapon';
}
export class Bandage extends Item {
  override name = 'bandage';
  override category = 'consumable_heal';
  override displayed = false;
  override sprite = '/sprites/items/bandage.png';
  override afflictions = [
    ['Lacerations', 20],
    ['Bleeding', 20],
  ];

  override heal(target: Entity) {
    if (target.Health) {
      for (let affliction of this.afflictions) {
        if (affliction[0] === 'Lacerations') {
          target.Health.healLimb([[affliction[0], affliction[1] as number]]);
        }
        if (affliction[0] === 'Bleeding') {
          target.Health.healLimb([[affliction[0], affliction[1] as number]]);
        }
      }
    }
  }
}

export class Flamethrower extends Item {
  override name = 'flamethrower';
  override category = 'weapon';
  override displayed = false;
  override sprite = '/sprites/items/flamethrower.png';
  override damage = 30;
  override range = 5;
  override slot = 'weapon';
  override afflictions = [['Burn', this.damage]];
}

export class StunGun extends Item {
  override name = 'stunGun';
  override category = 'weapon';
  override displayed = false;
  override sprite = '/sprites/items/placeholder.png';
  override afflictions = [
    ['Zapped', 10],
    ['Lacerations', 2],
    ['Bleeding', 2],
  ];
}

export class Medkit extends Item {
  override name = 'medkit';
  override category = 'consumable_heal';
  override displayed = false;
  override sprite = '/sprites/items/medkit.png';
  override afflictions: (any | null)[][] = [
    ['Lacerations', 50],
    ['Bleeding', 50],
  ];

  override heal(target: Entity) {
    if (target.Health) {
      for (let affliction of this.afflictions) {
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
export class Helmet extends Item {
  override name = 'helmet';
  override category = 'armor';
  override displayed = false;
  override sprite = '/sprites/items/helmet.png';
  override defense = 10;
  override slot = 'head';
}
export class Vest extends Item {
  override name = 'vest';
  override category = 'armor';
  override displayed = false;
  override sprite = '/sprites/items/vest.png';
  override defense = 20;
  override slot = 'torso';
}
