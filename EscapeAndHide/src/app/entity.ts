import { GameController } from './game.controller';
import { Health } from './health/health';
import { Inventory } from './inventory/inventory';
import { Item } from './items/items';
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

  takeDamage(damage: number, damageType: string) {
    this.damageResistance = 0;
    this.onTakeDamage(damage, damageType);
    if (this.damageable == true && this.destroyed == false) {
      if (this.inventory.headArmorSlot) {
        this.damageResistance += this.inventory.headArmorSlot.defense;
      }
      if (this.inventory.torsoArmorSlot) {
        this.damageResistance += this.inventory.torsoArmorSlot.defense;
      }
      if (this.inventory.fullbodyArmorSlot) {
        this.damageResistance += this.inventory.fullbodyArmorSlot.defense;
      }
      console.log('total damage resistance: ' + this.damageResistance);
      const finalDamage = Math.max(0, damage - this.damageResistance);
      if (this.Health) {
        this.Health.currentHealth -= finalDamage;
        if (this.Health.currentHealth <= 0) {
          this.destroy(damage, damageType);
        }
      } else {
        this.health -= finalDamage;
        if (this.health <= 0) {
          this.destroy(damage, damageType);
        }
      }
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
        // console.log('Equipped head armor:', item.name);
      } else if (item.slot && item.slot === 'torso') {
        this.inventory.torsoArmorSlot = item;
      } else if (item.slot && item.slot === 'fullbody') {
        this.inventory.fullbodyArmorSlot = item;
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
