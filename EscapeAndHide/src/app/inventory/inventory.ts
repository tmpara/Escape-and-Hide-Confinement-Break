import { Item } from './item';

export class Inventory {
  items: Item[] = [];
  maxItems: number = 10;

  constructor() {}

  addItem(itemName: string, itemCategory: string) {
    if (this.items.length < this.maxItems) {
      this.items.push(new Item(itemName, itemCategory, false));
    } else {
      alert('Inventory full');
    }
  }

  removeItem(itemIndex: number) {
    this.items.splice(itemIndex, 1);
  }

  getItems(): Item[] {
    return this.items;
  }
}
