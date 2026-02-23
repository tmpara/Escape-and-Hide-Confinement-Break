import {
  HeavyInterferanceUnitAI,
  LightInterferanceUnitAI,
  MediumInterferanceUnitAI,
  OppressorUnitAI,
  ScorcherUnitAI,
} from './enemyAI';
import { Entity } from './entity';
import { Health } from './health/health';
import {
  Bandage,
  BigGun,
  SmallGun,
  Helmet,
  Medkit,
  Vest,
  StunGun,
  Flamethrower,
} from './items/items';

export class Dummy extends Entity {
  override name = 'dummy';
  override sprite = '/sprites/npc/dummy.png';
  override deadSprite = '/sprites/npc/dummyDead.png';
  override posX = 0;
  override posY = 0;

  override collidable = true;
  override damageable = true;
  override Health = new Health(10, 10);
  override blockLOS = false;
  override flammable = true;
  override tags: string[] | null = ['dummy'];
  override inventorySize = 10;
  override itemPool = [
    new SmallGun(),
    new BigGun(),
    new Helmet(),
    new Vest(),
    new Bandage(),
    new Medkit(),
  ];

  constructor() {
    super();
    this.generateLoot();
  }

  override destroy(damage: number): void {
    if (this.destroyed == false) {
      this.destroyed = true;
      this.onDestroyed(damage);
      this.sprite = this.deadSprite;
    }
  }
  override onDestroyed(damage: number): void {
    this.lootable = true;
  }
}

export class HeavyDummy extends Entity {
  override name = 'heavy dummy';
  override sprite = '/sprites/npc/heavyDummy.png';
  override deadSprite = '/sprites/npc/heavyDummyDead.png';
  override posX = 0;
  override posY = 0;
  override zIndex = 3;
  override collidable = true;
  override damageable = true;
  override Health = new Health(5000, 5000);
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override tags: string[] | null = ['dummy'];
  override inventorySize = 10;
  override itemPool = [
    new SmallGun(),
    new BigGun(),
    new Helmet(),
    new Vest(),
    new Bandage(),
    new Medkit(),
  ];

  constructor() {
    super();
    this.generateLoot();
  }

  override destroy(damage: number): void {
    if (this.destroyed == false) {
      this.destroyed = true;
      this.onDestroyed(damage);
      this.sprite = this.deadSprite;
    }
  }
  override onDestroyed(damage: number): void {
    this.lootable = true;
  }
}

export class LightInterferanceUnit extends LightInterferanceUnitAI {
  override name = 'Light Interferance Unit';
  override description =
    'A small robotic unit made to stop you in your tracks. Nonlethal.';
  override sprite = '/sprites/npc/heavyDummy.png';
  override deadSprite = '/sprites/npc/heavyDummyDead.png';
  override collidable = true;
  override damageable = true;
  override Health = new Health(1000, 1000);
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override removeOnDestroy = false;
  override parentEntity = this;
  override ai = true;
  isDead = false;
  private weaponInitialized = false
  constructor() {
    super();
    this.inventory.weaponSlot = new StunGun();
  }

  override onDestroyed(damage: number): void {
    this.lootable = true;
  }
}
export class MediumInterferanceUnit extends MediumInterferanceUnitAI {
  override name = 'Medium Interferance Unit';
  override description =
    'A 4-legged robot with two double-cannons on mounted at its sides, lethal.';
  override sprite = '/sprites/npc/heavyDummy.png';
  override collidable = true;
  override damageable = true;
  override Health = new Health(2500, 2500);
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override parentEntity = this;
  override ai = true;
  isDead = false;

  constructor() {
    super();
    this.inventory.weaponSlot = new BigGun();
  }

}
export class HeavyInterferanceUnit extends HeavyInterferanceUnitAI {
  override name = 'Heavy Interferance Unit';
  override description =
    'A large 4-legged robotic unit with extreme destruction capabilities, extremely lethal.';
  override sprite = '/sprites/npc/heavyDummy.png';
  override collidable = true;
  override damageable = true;
  override Health = new Health(5000, 5000);
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override parentEntity = this;
  override ai = true;
  isDead = false;

  constructor() {
    super();
  }
}

export class OppressorUnit extends OppressorUnitAI {
  override name = 'Oppressor Unit';
  override description =
    'A large robotic unit built to crush anything in its path, extremely lethal.';
  override sprite = '/sprites/npc/heavyDummy.png';
  override collidable = true;
  override Health = new Health(2500, 2500);
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override parentEntity = this;
  override ai = true;
  isDead = false;
  private weaponInitialized = false;

  constructor() {
    super();
  }

}
export class ScorcherUnit extends ScorcherUnitAI {
  override name = 'Scorcher Unit';
  override description =
    'A heavy robotic unit equipped with a flamethrower, lethal.';
  override sprite = '/sprites/npc/heavyDummy.png';
  override collidable = true;
  override Health = new Health(2000, 2000);
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = false;
  override parentEntity = this;
  override ai = true;
  isDead = false;
  private weaponInitialized = false;

  constructor() {
    super();
  }
}
