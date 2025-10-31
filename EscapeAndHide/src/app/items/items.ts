import { Weapon } from './weapon';
import { Item } from './item';
import { Healing } from './healing';

export class Items {
  gun = new Weapon('gun', 'weapon', false, 'gun.png', 5, 5);
  bigGun = new Weapon('bigGun', 'weapon', false, 'biggun.png', 10, 7);
  medkit = new Healing('medkit', 'consumable', false, 'placeholder.png', 1.0);
}
