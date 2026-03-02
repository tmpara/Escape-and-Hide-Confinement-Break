import { Item } from '../items/items';
import { GameController } from '../game.controller';

export class Inventory {
  inventorySlots: (Item | null)[] = Array(10).fill(null);
  weaponSlot: Item | null = null;
  headArmorSlot: Item | null = null;
  torsoArmorSlot: Item | null = null;
  fullbodyArmorSlot: Item | null = null;

  equip(item: Item, index: number) {
    if (item.slot === 'weapon') {
      if (!this.weaponSlot) {
        this.weaponSlot = item;
        this.inventorySlots[index] = null;
        this.shiftItems();
      }
    } else if (item.slot === 'head') {
      if (!this.headArmorSlot) {
        this.headArmorSlot = item;
        this.inventorySlots[index] = null;
        this.shiftItems();
      }
    } else if (item.slot === 'torso') {
      if (!this.torsoArmorSlot) {
        this.torsoArmorSlot = item;
        this.inventorySlots[index] = null;
        this.shiftItems();
      }
    } else if (item.slot === 'fullbody') {
      if (!this.fullbodyArmorSlot) {
        this.fullbodyArmorSlot = item;
        this.inventorySlots[index] = null;
        this.shiftItems();
      }
    }
    GameController.current?.drawInventoryTab();
    GameController.current?.drawEquippedTab();
  }
  unequip(item: Item) {
    if (this.weaponSlot === item) {
      this.weaponSlot = null;
    } else if (this.headArmorSlot === item) {
      this.headArmorSlot = null;
    } else if (this.torsoArmorSlot === item) {
      this.torsoArmorSlot = null;
    } else if (this.fullbodyArmorSlot === item) {
      this.fullbodyArmorSlot = null;
    }
    const emptyIndex = this.inventorySlots.indexOf(null);
    if (emptyIndex !== -1) {
      this.inventorySlots[emptyIndex] = item;
    }
    GameController.current?.drawInventoryTab();
    GameController.current?.drawEquippedTab();
  }

  pickUp(item: Item, source?: { floorX: number; floorY: number } | any) {
    const emptyIndex = this.inventorySlots.indexOf(null);
    if (emptyIndex !== -1) {
      this.inventorySlots[emptyIndex] = item;

      if (source) {
        if (source.floorX && source.floorY) {
          GameController.current?.removeItem(source.floorX, source.floorY);
        } else if (source.inventory) {
          const itemIndex = source.inventory.inventorySlots.indexOf(item);
          if (itemIndex !== -1) {
            source.inventory.inventorySlots[itemIndex] = null;
          }
          GameController.current?.drawLootOverlay(source);
        }
      }
    }
    console.log('player inventory: ', this.inventorySlots);
    GameController.current?.drawInventoryTab();
    GameController.current?.drawEquippedTab();
  }

  drop(item: Item, isEquipped: boolean) {
    const x = GameController.current?.player1.posX;
    const y = GameController.current?.player1.posY;
    if (typeof x !== 'number' || typeof y !== 'number') return;
    if (GameController.current?.map.tiles[x][y].item == null) {
      if (isEquipped) {
        this.unequip(item);
      } else {
        const index = this.inventorySlots.indexOf(item);
        if (index !== -1) {
          this.inventorySlots[index] = null;
        }
      }
      GameController.current?.drawInventoryTab();
      GameController.current?.drawEquippedTab();
      if (GameController.current) {
        GameController.current.spawnItem(x, y, item);
      }
      this.shiftItems();
    }
  }

  getItems(): Item[] {
    return this.inventorySlots.filter((item): item is Item => item !== null);
  }

  shiftItems() {
    const items = this.getItems();
    this.inventorySlots = [
      ...items,
      ...Array(this.inventorySlots.length - items.length).fill(null),
    ];
  }
}
