import { Items } from '../items/items';
import { Inventory } from './inventory';
import * as PIXI from 'pixi.js';

export class inventoryRendering {
  app!: PIXI.Application;
  equippedApp!: PIXI.Application;
  inventory: Inventory = new Inventory();
  items = new Items();
  container: HTMLDivElement;
  equippedContainer: HTMLDivElement;

  constructor(container: HTMLDivElement, equippedContainer: HTMLDivElement) {
    this.container = container;
    this.equippedContainer = equippedContainer;
    this.initPIXI();
    this.initEquippedPIXI();
  }

  async initPIXI() {
    this.app = new PIXI.Application();
    await this.app.init({
      width: 300,
      height: 400,
      backgroundColor: 0x1099bb,
    });
    this.container.appendChild(this.app.canvas as HTMLCanvasElement);
    this.displayInventory();
  }

  async initEquippedPIXI() {
    this.equippedApp = new PIXI.Application();
    await this.equippedApp.init({
      width: 300,
      height: 400,
      backgroundColor: 0x333399,
    });
    this.equippedContainer.appendChild(
      this.equippedApp.canvas as HTMLCanvasElement
    );
    this.displayEquipped();
  }

  displayInventory() {
    this.app.stage.removeChildren();
    for (let i = 0; i < this.inventory.items.length; i++) {
      this.inventory.items[i].displayed = false;
    }

    for (let i = 0; i < this.inventory.items.length; i++) {
      if (!this.inventory.items[i].displayed) {
        this.inventory.items[i].displayed = true;
        const texture = PIXI.Assets.get(
          this.inventory.items[i].sprite as string
        ) as PIXI.Texture;
        const sprite = new PIXI.Sprite(texture);
        sprite.x = 0;
        sprite.y = 0;

        const text = new PIXI.Text({
          text: this.inventory.items[i].name,
          style: {
            fontFamily: 'Arial',
            fontSize: 28,
            wordWrap: true,
          },
        });
        text.anchor.set(0);
        text.x = sprite.width + 10;
        text.y = 0;
        text.eventMode = 'static';
        text.onpointerupoutside = () => this.drop(i);
        text.onclick = () => this.equip(i);

        const itemContainer = new PIXI.Container();
        itemContainer.x = 10;
        itemContainer.y = 10 + i * 35;
        itemContainer.addChild(sprite);
        itemContainer.addChild(text);
        this.app.stage.addChild(itemContainer);
      }
    }
  }

  displayEquipped() {
    this.equippedApp.stage.removeChildren();
    for (let i = 0; i < this.inventory.equippedItems.length; i++) {
      this.inventory.equippedItems[i].displayed = false;
    }

    for (let i = 0; i < this.inventory.equippedItems.length; i++) {
      if (!this.inventory.equippedItems[i].displayed) {
        this.inventory.equippedItems[i].displayed = true;
        const texture = PIXI.Assets.get(
          this.inventory.equippedItems[i].sprite as string
        ) as PIXI.Texture;
        const sprite = new PIXI.Sprite(texture);
        sprite.x = 0;
        sprite.y = 0;

        const text = new PIXI.Text({
          text: this.inventory.equippedItems[i].name,
          style: {
            fontFamily: 'Arial',
            fontSize: 28,
            wordWrap: true,
          },
        });
        text.anchor.set(0);
        text.x = sprite.width + 10;
        text.y = 0;
        text.eventMode = 'static';
        text.onclick = () => this.unequip(i);

        const itemContainer = new PIXI.Container();
        itemContainer.x = 10;
        itemContainer.y = 10 + i * 40;
        itemContainer.addChild(sprite);
        itemContainer.addChild(text);
        this.equippedApp.stage.addChild(itemContainer);
      }
    }
  }

  equip(itemIndex: number) {
    this.inventory.equipItem(itemIndex);
    this.displayInventory();
    this.displayEquipped();
  }

  unequip(itemIndex: number) {
    this.inventory.unequipItem(itemIndex);
    this.displayInventory();
    this.displayEquipped();
  }

  pickUp(itemName: string, itemCategory: string, itemSprite: string) {
    this.inventory.addItem(itemName, itemCategory, itemSprite);
    this.displayInventory();
    this.displayEquipped();
  }

  drop(itemIndex: number) {
    this.inventory.removeItem(itemIndex);
    this.displayInventory();
    this.displayEquipped();
  }
}
