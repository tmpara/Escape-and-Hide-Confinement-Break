import { Item } from './item';

export class Inventory {
  items: Item[] = [];
  equippedItems: Item[] = [];
  maxItems: number = 10;
  maxEquippedItems: number = 2;

  addItem(itemName: string, itemCategory: string, itemSprite: String) {
    if (this.items.length < this.maxItems) {
      this.items.push(new Item(itemName, itemCategory, false, itemSprite));
    } else {
      alert('Inventory full');
    }
  }

  equipItem(itemIndex: number) {
    if (this.equippedItems.length < this.maxEquippedItems) {
      const item = this.items[itemIndex];
      this.equippedItems.push(item);
      this.items.splice(itemIndex, 1);
    } else {
      alert('Cannot equip more items');
    }
  }

  unequipItem(itemIndex: number) {
    const item = this.equippedItems[itemIndex];
    if (item) {
      this.items.push(item);
      this.equippedItems.splice(itemIndex, 1);
    }
  }

  removeItem(itemIndex: number) {
    this.items.splice(itemIndex, 1);
  }

  getItems(): Item[] {
    return this.items;
  }
  getEquippedItems(): Item[] {
    return this.equippedItems;
  }
}
