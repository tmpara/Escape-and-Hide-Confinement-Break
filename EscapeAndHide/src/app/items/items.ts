import { Weapon } from './weapon';
import { Healing } from './healing';
import { Armor } from './armor';

export class Items {
  gun = new Weapon('gun', 'weapon', false, 'gun.png', null, 2, 5);
  bigGun = new Weapon('bigGun', 'weapon', false, 'biggun.png', null, 5, 7);
  bandage = new Healing('bandage', 'consumable', false, 'placeholder.png', null, 0.5);
  medkit = new Healing('medkit', 'consumable', false, 'placeholder.png', null, 1.0);
  helmet = new Armor('helmet', 'armor', false, 'placeholder.png', null, 2, 'head');
  bodyArmor = new Armor('bodyArmor', 'armor', false, 'placeholder.png', null, 5, 'body');
}
