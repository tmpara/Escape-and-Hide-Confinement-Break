import { GameController } from './game.controller';
import { Afflcition } from './health/afflictions';
import { affliction, LimbName } from './health/health';
import { Inventory } from './inventory/inventory';
import { Item } from './items/items';
import { Player } from './player';
export abstract class Entity {
  id = 0;
  name = '';
  description = '';
  sprite = 'placeholder.png';
  deadSprite = '';
  tags: string[] | null = null;
  connectsWith: string | null = null;
  spriteTopCap = '';
  spriteBottomCap = '';
  spriteLeftCap = '';
  spriteRightCap = '';
  spriteTopLeftCorner = '';
  spriteTopRightCorner = '';
  spriteBottomLeftCorner = '';
  spriteBottomRightCorner = '';
  posX = 0;
  posY = 0;
  zIndex = 4;
  collidable = false;
  damageable = false;
  health = 0;
  Health: import('./health/health').Health | null = null;
  damageResistance = 0;
  hiddenOutsideLOS = false;
  blockLOS = false;
  flammable = false;
  lootable = false;
  maxHealth = this.health;
  destroyed = false;
  removeOnDestroy = true;
  fireValue = 0;
  ai = false;
  itemPool: Item[] = [];
  inventorySize = 0;
  inventory = new Inventory();

  takeDamage(user: any) {
    let targetLimb: LimbName = 'torso';
    if (!this.Health) return;
    let miss = Math.random();
    if (miss > user.accuracy) {
      return; //missed attack
    } else if (miss > user.accuracy * 2) {
      const limbs: LimbName[] = [
        'head',
        'leftArm',
        'rightArm',
        'leftLeg',
        'rightLeg',
      ];
      const randomIndex = Math.floor(Math.random() * limbs.length);
      targetLimb = limbs[randomIndex];
    }
    let afflictions: affliction[] = [];
    for (let affliction of user.weaponSlot.afflictions) {
      afflictions.push([affliction[0], affliction[1]]);
    }
    this.Health.damageLimb(targetLimb, afflictions);
  }

  takeStructureDamage(damage: number, damageType: string) {
    this.onTakeDamage(damage, damageType);
    this.health -= damage;
    if (this.health <= 0) {
      this.destroy(damage, damageType);
    }
  }

  heal(amount: number) {
    this.onHeal(amount);
    if (this.damageable == true && this.destroyed == false) {
      if (this.Health) {
        this.Health.currentHealth += amount;
        if (this.Health.currentHealth > this.Health.maxHealth) {
          this.Health.currentHealth = this.Health.maxHealth;
        }
      } else {
        this.health += amount;
        if (this.health > this.maxHealth) {
          this.health = this.maxHealth;
        }
      }
    }
  }

  destroy(damage: number, damageType: string) {
    if (this.destroyed == false) {
      this.destroyed = true;
      this.onDestroyed(damage, damageType);
      GameController.current?.removeEntities(this.posX, this.posY);
    }
  }

  generateLoot() {
    const lootLimit = Math.floor(Math.random() * 5) + 1;
    const selectedItems: Item[] = [];
    while (
      selectedItems.length < this.inventorySize ||
      selectedItems.length < lootLimit
    ) {
      const lootIndex = Math.floor(Math.random() * this.itemPool.length);
      selectedItems.push(this.itemPool[lootIndex]);
    }
    for (const item of selectedItems) {
      if (item.slot && item.slot === 'weapon') {
        this.inventory.weaponSlot = item;
        // console.log('Equipped weapon:', item.name);
      } else if (item.slot && item.slot === 'head') {
        this.inventory.headArmorSlot = item;
        this.damageResistance += item.defense;
        // console.log('Equipped head armor:', item.name);
      } else if (item.slot && item.slot === 'torso') {
        this.inventory.torsoArmorSlot = item;
        this.damageResistance += item.defense;
        // console.log('Equipped torso armor:', item.name);
      } else if (item.slot && item.slot === 'fullbody') {
        this.inventory.fullbodyArmorSlot = item;
        this.damageResistance += item.defense;
        // console.log('Equipped full body armor:', item.name);
      }
      const emptyIndex = this.inventory.inventorySlots.indexOf(null);
      if (emptyIndex !== -1) {
        this.inventory.inventorySlots[emptyIndex] = item;
      }
    }
    console.log('entity inventory: ', this.inventory.inventorySlots);
  }

  onTakeDamage(damage: number, damageType: string) {}

  onDestroyed(damage: number, damageType: string) {}

  onUse(user: Entity | null) {}

  onSteppedOn(user: Entity | null) {}

  onEndTurn() {}

  onHeal(amountHealed: number) {}

  onSpawn() {}
}
