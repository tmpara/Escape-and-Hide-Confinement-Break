import { BasicEnemyAI } from './enemyAI';
import { Entity } from './entity';
import { Inventory } from './inventory/inventory';
import {
  bandage,
  bigGun,
  gun,
  helmet,
  Item,
  medkit,
  vest,
} from './items/items';

export class Dummy extends Entity {
  override name = 'dummy';
  override sprite = '/sprites/npc/dummy.png';
  override deadSprite = '/sprites/npc/dummyDead.png';
  override posX = 0;
  override posY = 0;
  override collidable = true;
  override damageable = true;
  // override health = 100;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override tags: string[] | null = ['dummy'];
  override inventory = new Inventory();
  override inventorySlots: (Item | null)[] = [];
  lootTable = [
    new gun(),
    new bigGun(),
    new helmet(),
    new vest(),
    new bandage(),
    new medkit(),
  ];

  constructor() {
    super();
    this.inventorySlots = Array(this.inventorySize).fill(null);
    for (let i = 0; i < this.inventorySlots.length; i++) {
      this.inventorySlots[i] =
        this.lootTable[Math.floor(Math.random() * this.lootTable.length)];
      this.inventory.equip(this.inventorySlots[i]!);
    }
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

export class HeavyDummy extends Entity {
  override name = 'heavy dummy';
  override sprite = '/sprites/npc/heavyDummy.png';
  override deadSprite = '/sprites/npc/heavyDummyDead.png';
  override posX = 0;
  override posY = 0;
  override zIndex = 3;
  override collidable = true;
  override damageable = true;
  // override health = 4;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override tags: string[] | null = ['dummy'];
  override inventory = new Inventory();
  override inventorySlots: (Item | null)[] = [];
  lootTable = [
    new gun(),
    new bigGun(),
    new helmet(),
    new vest(),
    new bandage(),
    new medkit(),
  ];

  constructor() {
    super();
    this.inventorySlots = Array(this.inventorySize).fill(null);
    for (let i = 0; i < this.inventorySlots.length; i++) {
      this.inventorySlots[i] =
        this.lootTable[Math.floor(Math.random() * this.lootTable.length)];
      console.log(this.inventorySlots[i]);
      this.inventory.equip(this.inventorySlots[i]!);
    }
    console.log(this.inventory.headArmorSlot, this.inventory.torsoArmorSlot);
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

export class LightInterferanceUnit extends BasicEnemyAI {
  override name = 'Light Interferance Unit';
  override description =
    'A small robotic unit made to stop you in your tracks. Nonlethal.';
  override sprite = '/sprites/npc/heavyDummy.png';
  override deadSprite = '/sprites/npc/heavyDummyDead.png';
  override collidable = true;
  override damageable = true;
  // override health = 50;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  override parentEntity = this;
  override ai = true;
  lootTable = [];

  override onEndTurn() {
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
