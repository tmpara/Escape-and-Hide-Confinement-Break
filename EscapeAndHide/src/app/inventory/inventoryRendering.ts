import { Items } from './items';
import { Inventory } from './inventory';
import * as PIXI from 'pixi.js';

export class inventoryRendering {
  app!: PIXI.Application;
  inventory: Inventory = new Inventory();
  items = new Items();
  container: HTMLDivElement;
  constructor(container: HTMLDivElement) {
    this.container = container;
    this.initPIXI();
  }

  async initPIXI() {
    this.app = new PIXI.Application();
    await this.app.init({
      width: 300,
      height: 400,
      backgroundColor: 0x1099bb,
    });
    this.container.appendChild(this.app.canvas as HTMLCanvasElement);
    this.display();
  }
  display() {
    this.app.stage.removeChildren();
    for (let i = 0; i < this.inventory.items.length; i++) {
      this.inventory.items[i].displayed = false;
    }

    for (let i = 0; i < this.inventory.items.length; i++) {
      if (!this.inventory.items[i].displayed) {
        this.inventory.items[i].displayed = true;
        const text = new PIXI.Text({
          text: this.inventory.items[i].name,
          style: {
            fontFamily: 'Arial',
            fontSize: 28,
            wordWrap: true,
          },
        });
        text.anchor.set(0);
        text.x = 10;
        text.y = 10 + i * 40;
        text.eventMode = 'static';
        text.onclick = () => this.drop(i);
        this.app.stage.addChild(text);
      }
    }
  }

  pickUp(itemName: string, itemCategory: string) {
    this.inventory.addItem(itemName, itemCategory);
    this.display();
  }

  drop(itemIndex: number) {
    this.inventory.removeItem(itemIndex);
    this.display();
  }
}
