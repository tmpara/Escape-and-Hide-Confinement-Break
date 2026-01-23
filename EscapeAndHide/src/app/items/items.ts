import { Entity } from '../entity';

export abstract class Item {
  name = '';
  category = '';
  displayed = false;
  sprite = 'placeholder.png';
  isEquipped: boolean = false;
  damage = 0;
  range = 0;
  healAmount = 0;
  defense = 0;
  slot = '';

  dealDamage(target: Entity) {
    target.takeDamage(this.damage, 'laceration');
  }

  heal(target: Entity) {
    target.heal(this.healAmount);
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
  override damage = 50;
  override range = 7;
  override slot = 'weapon';

  override dealDamage(target: Entity) {
    if (target.damageable) target.takeDamage(this.damage, 'gunshot');
  }
}
export class bandage extends Item {
  override name = 'bandage';
  override category = 'consumable';
  override displayed = false;
  override sprite = '/sprites/items/bandage.png';
  override healAmount = 50;
  override slot = 'consumable';

  override heal(target: Entity) {
    target.heal(this.healAmount);
  }
}
export class medkit extends Item {
  override name = 'medkit';
  override category = 'consumable';
  override displayed = false;
  override sprite = '/sprites/items/medkit.png';
  override healAmount = 100;
  override slot = 'consumable';

  override heal(target: Entity) {
    target.heal(this.healAmount);
  }
}
export class helmet extends Item {
  override name = 'helmet';
  override category = 'armor';
  override displayed = false;
  override sprite = 'placeholder.png';
  override defense = 2;
  override slot = 'head';
}
export class bodyArmor extends Item {
  override name = 'bodyArmor';
  override category = 'armor';
  override displayed = false;
  override sprite = 'placeholder.png';
  override defense = 5;
  override slot = 'body';
}