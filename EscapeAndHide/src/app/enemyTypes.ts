import { BasicEnemyAI, HeavyInterferanceUnitAI, LightInterferanceUnitAI, MediumInterferanceUnitAI, TrapperUnitAI, OppressorUnitAI, ScorcherUnitAI, Boss1AI, Boss1AILeg } from './enemyAI';
import { Entity } from './entity';
import { Item } from './items/items';
import { gun,bigGun,bandage,medkit } from './items/items';

export class Dummy extends Entity {
  override name = 'dummy';
  override description = "Dummy description."
  override sprite = '/sprites/npc/dummy.png';
  override deadSprite = '/sprites/npc/dummyDead.png';
  override posX = 0;
  override posY = 0;
  override collidable = true;
  override damageable = true;
  override health = 2;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override removeOnDestroy = false;
  override tags: string[] | null = ['dummy'];
  lootTable = [new gun(), new bandage()];

  override onDestroyed(damage: number, damageType: string): void{
    this.lootable = true;
  }
}

export class HeavyDummy extends Entity {
  override name = 'heavy dummy';
  override sprite = '/sprites/npc/heavyDummy.png';
  override deadSprite = '/sprites/npc/heavyDummyDead.png';
  override posX = 0;
  override posY = 0;
  override collidable = true;
  override damageable = true;
  override health = 4;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override removeOnDestroy = false;
  override tags: string[] | null = ['dummy'];
  lootTable = [new bigGun(), new medkit()];

  override onDestroyed(damage: number, damageType: string): void{
    this.lootable = true;
  }
}

export class LightInterferanceUnit extends LightInterferanceUnitAI{
  override name = "Light Interferance Unit";
  override description = "A small robotic unit made to stop you in your tracks. Nonlethal."
  override sprite = "/sprites/npc/heavyDummy.png";
  override deadSprite = '/sprites/npc/heavyDummyDead.png';
  override collidable = true;
  override damageable = true;
  override health = 50;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override removeOnDestroy = false;
  override parentEntity = this;
  override ai = true;
  
  isDead = false;
  lootTable = [];

  override onDestroyed(damage: number, damageType: string): void{
    this.lootable = true;
  }

}
export class MediumInterferanceUnit extends MediumInterferanceUnitAI{
  override name = "Medium Interferance Unit";
  override description = "A 4-legged robot with two double-cannons on mounted at its sides, lethal."
  override sprite = "/sprites/npc/heavyDummy.png";
  override collidable = true;
  override damageable = true;
  override health = 100;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override parentEntity = this;
  override ai = true;
  
  isDead = false;
  lootTable = [new gun(), new bandage()];
}
export class HeavyInterferanceUnit extends HeavyInterferanceUnitAI{
  override name = "Heavy Interferance Unit";
  override description = "A large 4-legged robotic unit with extreme destruction capabilities, extremely lethal."
  override sprite = "/sprites/npc/heavyDummy.png"
  override collidable = true;
  override damageable = true;
  override health = 500;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override parentEntity = this;
  override ai = true;
  
  isDead = false;
  lootTable = [new gun(), new bandage()];
}

export class OppressorUnit extends OppressorUnitAI{
  override name = "Oppressor Unit";
  override description = "A large robotic unit built to crush anything in its path, extremely lethal."
  override sprite = "/sprites/npc/heavyDummy.png"
  override collidable = true
  override health = 300;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override parentEntity = this;
  override ai = true;
  
  isDead = false;
  lootTable = [new gun(), new bandage()];
}

export class ScorcherUnit extends ScorcherUnitAI{
  override name = "Scorcher Unit";
  override description = "A heavy robotic unit equipped with a flamethrower, lethal."
  override sprite = "/sprites/npc/heavyDummy.png"
  override collidable = true
  override health = 400;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = false;
  override parentEntity = this;
  override ai = true;

  isDead = false;
  lootTable = [new gun(), new bandage()];
}

export class TrapperUnit extends TrapperUnitAI{
  override name = "Trapper Unit";
  override description = "A small robotic unit that deploys traps to hinder your movement."
  override sprite = "/sprites/npc/heavyDummy.png"
  override collidable = true
  override health = 200;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = false;
  override parentEntity = this;
  override ai = true;

  isDead = false;
  lootTable = [new gun(), new bandage()];
}

export class Boss1Unit extends Boss1AI{
  override name = "The Immovable One";
  override description = "The first boss of the game, a giant robotic unit with immense health and powerful attacks. It has four legs that can attack independently, and a main body that can also attack. It is extremely lethal."
  override sprite = "/sprites/npc/heavyDummy.png"
  override collidable = true
  override health = 2000
  // render above its legs
  override zIndex = 9;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = false;
  override parentEntity = this;
  override ai = true;
}

export class Boss1UnitLeg extends Boss1AILeg{

  override name = "The Immovable One's Leg";
  override description = "One of the legs of The Immovable One. It can attack independently, but is much weaker than the main body."
  override sprite = "/sprites/npc/heavyDummy.png"
  // Legs should not block movement for their parent boss
  override collidable = false
  // legs render below the boss
  override zIndex = 6;
  override health = 250;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = false;
  override parentEntity = this;
  override ai = true;

}