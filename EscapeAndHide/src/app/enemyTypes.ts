import { BasicEnemyAI, HeavyInterferanceUnitAI, LightInterferanceUnitAI, MediumInterferanceUnitAI, OppressorUnitAI, ScorcherUnitAI } from './enemyAI';
import { Entity } from './entity';
import { Items } from './items/items';

export class Dummy extends Entity {
  override name = 'dummy';
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
  lootTable = [new Items().gun, new Items().bandage];

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
  lootTable = [new Items().bigGun, new Items().medkit];

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

  override async onEndTurn(){
   await this.Main();
  }

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
  lootTable = [new Items().gun, new Items().bandage];

  override async onEndTurn(){
   await this.Main();
  }

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
  lootTable = [new Items().gun, new Items().bandage];

  override async onEndTurn(){
   await this.Main();
  }
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
  lootTable = [new Items().gun, new Items().bandage];

  override async onEndTurn(){
   await this.Main();
  }
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
  lootTable = [new Items().gun, new Items().bandage];
  override async onEndTurn(){
   await this.Main();
  }


}