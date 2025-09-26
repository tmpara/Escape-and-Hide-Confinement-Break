import { Item } from "./item";

export class Inventory {
    items: Item[] = [];

    addItem(itemName: string) {
        this.items.push(new Item(itemName, false));
    }

    removeItem(itemIndex: number) {
        this.items.splice(itemIndex, 1);
    }
    
    getItems(): Item[] {
        return this.items;
    }
}