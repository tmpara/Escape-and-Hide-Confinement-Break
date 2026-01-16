import { BasicEnemyAI } from './enemyAI';
import { Entity } from './entity';
import { Item } from './items/items';
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
  override tags: string[] | null = ['dummy'];
  lootTable = [new Items().gun, new Items().bandage];

  override destroy(damage: number, damageType: string): void {
    if (this.destroyed == false) {
      this.destroyed = true;
      this.onDestroyed(damage, damageType);
      this.sprite = this.deadSprite;
    }
  }
  override onDestroyed(damage: number, damageType: string): void {
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
  override tags: string[] | null = ['dummy'];
  lootTable = [new Items().bigGun, new Items().medkit];

  override destroy(damage: number, damageType: string): void {
    if (this.destroyed == false) {
      this.destroyed = true;
      this.onDestroyed(damage, damageType);
      this.sprite = this.deadSprite;
    }
  }
  override onDestroyed(damage: number, damageType: string): void {
    this.lootable = true;
  }
}

export class LightInterferanceUnit extends BasicEnemyAI{
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
  override parentEntity = this;
  override ai = true;
  lootTable = [new Items().gun, new Items().bandage];

  override onEndTurn(){
    this.Main();
  }

  override destroy(damage: number, damageType: string): void {
    if (this.destroyed == false) {
      this.destroyed = true;
      this.onDestroyed(damage, damageType);
      this.sprite = this.deadSprite;
    }
  }
  override onDestroyed(damage: number, damageType: string): void {
    this.lootable = true;
  }
}
