import { BasicEnemyAI } from './enemyAI';
import { Entity } from './entity';
import { Item } from './items/item';
import { Items } from './items/items';

export class Dummy extends Entity {
  override name = "dummy";
  override sprite = "/sprites/npc/dummy.png";
  override posX = 0;
  override posY = 0;
  override collidable = true;
  override damageable = true;
  override health = 100;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  isDead = false;
  lootTable = [new Items().gun, new Items().bandage];
  
}

export class HeavyDummy extends Entity {
  override name = "heavy dummy";
  override sprite = "/sprites/npc/heavyDummy.png";
  override posX = 0;
  override posY = 0;
  override collidable = true;
  override damageable = true;
  override health = 200;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  isDead = false;
  lootTable = [new Items().gun, new Items().bandage];

}

export class LightInterferanceUnit extends BasicEnemyAI{
  override name = "Light Interferance Unit";
  override description = "A small robotic unit made to stop you in your tracks. Nonlethal."
  override sprite = "/sprites/npc/heavyDummy.png";
  override collidable = true;
  override damageable = true;
  override health = 50;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override parentEntity = this;
  
  isDead = false;
  lootTable = [new Items().gun, new Items().bandage];

  override onEndTurn(){
    this.Main();
  }

}