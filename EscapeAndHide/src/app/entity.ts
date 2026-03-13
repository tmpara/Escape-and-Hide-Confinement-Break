import { GameController } from './game.controller';
import { affliction, LimbName } from './health/health';
import { Inventory } from './inventory/inventory';
import { Item } from './items/items';
import { Health } from './health/health';
export abstract class Entity {
  id = 0;
  name = '';
  description = '';
  sprite = 'placeholder.png';
  deadSprite = '';
  sizeOffsetX = 0;
  sizeOffsetY = 0;
  sizeX = 1;
  sizeY = 1;
  rotation = 0;
  posX = 0;
  posY = 0;
  zIndex = 5;
  spriteCap = '';
  spriteCorner = '';
  connectsWith: string | null = null;
  tags: string[] | null = null;
  interactable = false;
  collidable = false;
  pushable = false;
  damageable = false;
  health = 0;
  Health: Health | null = null;
  damageResistance = 0;
  hiddenOutsideLOS = false;
  blockLOS = false;
  flammable = false;
  lootable = false;
  maxHealth = this.health;
  destroyed = false;
  removeOnDestroy = true;
  initialised = false;
  fireValue = 0;
  ai = false;
  itemPool: Item[] = [];
  inventorySize = 0;
  inventory = new Inventory();

  takeDamage(user: any) {}

  takeStructureDamage(damage: number) {
    this.onTakeDamage(damage);
    this.health -= damage;
    console.log(
      `${this.name} took ${damage} structure damage. Remaining health: ${this.health}`,
    );
    if (this.health <= 0) {
      this.destroy();
    }
  }

  destroy() {
    if (this.destroyed == false) {
      this.destroyed = true;
      if (this.removeOnDestroy == true) {
        GameController.current?.removeEntities(this.posX, this.posY, this.id);
      } else {
        this.sprite = this.deadSprite;
      }
    }
  }

  generateLoot() {
    if (!this.itemPool || this.itemPool.length === 0) {
      return;
    }
    const lootLimit = Math.floor(Math.random() * 5) + 1;
    const selectedItems: Item[] = [];
    while (
      selectedItems.length < this.inventorySize &&
      selectedItems.length < lootLimit
    ) {
      const lootIndex = Math.floor(Math.random() * this.itemPool.length);
      const item = this.itemPool[lootIndex];
      if (item) {
        const newItem = new (item.constructor as any)();
        selectedItems.push(newItem);
      }
    }
    for (const item of selectedItems) {
      if (!item) continue;

      if (item.slot) {
        if (item.slot === 'weapon') {
          this.inventory.weaponSlot = item;
          // console.log('Equipped weapon:', item.name);
        } else if (item.slot === 'head') {
          this.inventory.headArmorSlot = item;
          this.damageResistance += item.defense;
          // console.log('Equipped head armor:', item.name);
        } else if (item.slot === 'torso') {
          this.inventory.torsoArmorSlot = item;
          this.damageResistance += item.defense;
          // console.log('Equipped torso armor:', item.name);
        } else if (item.slot === 'fullbody') {
          this.inventory.fullbodyArmorSlot = item;
          this.damageResistance += item.defense;
          // console.log('Equipped full body armor:', item.name);
        }
      }

      const emptyIndex = this.inventory.inventorySlots.indexOf(null);
      if (emptyIndex !== -1) {
        this.inventory.inventorySlots[emptyIndex] = item;
      }
    }
    console.log('entity inventory: ', this.inventory.inventorySlots);
  }

  onTakeDamage(damage: number) {}

  onDestroyed(damage: number) {}

  onUse(user: Entity | null) {}

  onSteppedOn(user: Entity | null) {}

  onEndTurn() {}

  onHeal(amountHealed: number) {}

  onSpawn() {}

  getInfo() {
    return {
      name: 'Name: ' + this.name,
      description: 'Description: ' + this.description,
      maxHealth: 'Max Health: ' + this.maxHealth,
      damageResistance: 'Damage resistance: ' + this.damageResistance,
    };
  }
}
