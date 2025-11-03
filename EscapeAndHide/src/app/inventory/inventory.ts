import { Item } from '../items/item';
import { Weapon } from '../items/weapon';
import * as PIXI from 'pixi.js';

export class Inventory {
  items: (Item | Weapon)[] = [];
  equippedItems: Item[] = [];
  equippedWeapon: Weapon | null = null;
  inventorySize: number = 10;
  maxEquippedItems: number = 2;
  app!: PIXI.Application;
  equippedApp!: PIXI.Application;
  inventoryContainer: HTMLDivElement;
  equippedContainer: HTMLDivElement;
  pickUpOverlay: HTMLDivElement | null = null;

  constructor(container: HTMLDivElement, equippedContainer: HTMLDivElement) {
    this.inventoryContainer = container;
    this.equippedContainer = equippedContainer;
    this.initInventory();
    this.initEquipped();
  }

  async initInventory() {
    this.app = new PIXI.Application();
    await this.app.init({
      width: 300,
      height: 400,
      backgroundColor: 0x1099bb,
    });
    this.inventoryContainer.appendChild(this.app.canvas as HTMLCanvasElement);
    this.displayInventory();
  }

  async initEquipped() {
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

  hidePickUpPrompt() {
    if (this.pickUpOverlay) {
      this.pickUpOverlay.remove();
      this.pickUpOverlay = null;
    }
  }

  showPickUpPrompt(item: Item | Weapon): Promise<boolean> {
    if (!this.pickUpOverlay) {
      this.ensurePopupStyles();

      const overlay = document.createElement('div');
      overlay.className = 'pickup-overlay';

      const box = document.createElement('div');
      box.className = 'pickup-box';

      const title = document.createElement('div');
      title.className = 'popup-title';
      title.textContent = 'Pick up item?';

      const name = document.createElement('div');
      name.className = 'popup-item-name';
      name.textContent = item.name;

      const msg = document.createElement('div');
      msg.className = 'popup-msg';
      msg.textContent = ''; // used for errors like "Inventory full"

      const buttons = document.createElement('div');
      buttons.className = 'popup-buttons';

      const confirm = document.createElement('button');
      confirm.className = 'popup-btn confirm';
      confirm.textContent = 'Confirm';

      const cancel = document.createElement('button');
      cancel.className = 'popup-btn cancel';
      cancel.textContent = 'Cancel';

      buttons.appendChild(confirm);
      buttons.appendChild(cancel);

      box.appendChild(title);
      box.appendChild(name);
      box.appendChild(msg);
      box.appendChild(buttons);
      overlay.appendChild(box);

      document.body.appendChild(overlay);
      this.pickUpOverlay = overlay;

      return new Promise<boolean>((resolve) => {
+      confirm.onclick = () => {
+        this.hidePickUpPrompt();
+        resolve(true);
+      };
+      cancel.onclick = () => {
+        this.hidePickUpPrompt();
+        resolve(false);
+      };
+      // If desired, clicking outside box cancels:
+      overlay.onclick = (e) => {
+        if (e.target === overlay) {
+          this.hidePickUpPrompt();
+          resolve(false);
+        }
+      };
+    });
    }
  }

  private ensurePopupStyles() {
    if (document.getElementById('inventory-popup-styles')) return;
    const style = document.createElement('style');
    style.id = 'inventory-popup-styles';
    style.textContent = `
      .pickup-overlay {
        position: fixed;
        left: 0; top: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
      }
      .pickup-box {
        background: #121212;
        color: #fff;
        padding: 18px;
        border-radius: 8px;
        width: 320px;
        max-width: calc(100% - 40px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        text-align: center;
        font-family: Arial, Helvetica, sans-serif;
      }
      .popup-title { font-weight: 700; margin-bottom: 8px; font-size: 18px; }
      .popup-item-name { margin: 6px 0 12px; font-size: 16px; }
      .popup-sprite img { max-width: 64px; max-height: 64px; display:block; margin: 0 auto 8px; }
      .popup-msg { min-height: 18px; margin-bottom: 8px; font-size: 14px; }
      .popup-buttons { display:flex; gap: 8px; justify-content:center; }
      .popup-btn {
        padding: 8px 12px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 14px;
      }
      .popup-btn.confirm { background: #2e8b57; color: white; }
      .popup-btn.cancel { background: #444; color: white; }
    `;
    document.head.appendChild(style);
  }

  displayInventory() {
    this.app.stage.removeChildren();
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].displayed = false;
    }

    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i].displayed) {
        this.items[i].displayed = true;
        const texture = PIXI.Assets.get(
          this.items[i].sprite as string
        ) as PIXI.Texture;
        const sprite = new PIXI.Sprite(texture);
        sprite.x = 0;
        sprite.y = 0;

        const text = new PIXI.Text({
          text: this.items[i].name,
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
    for (let i = 0; i < this.equippedItems.length; i++) {
      this.equippedItems[i].displayed = false;
    }

    for (let i = 0; i < this.equippedItems.length; i++) {
      if (!this.equippedItems[i].displayed) {
        this.equippedItems[i].displayed = true;
        const texture = PIXI.Assets.get(
          this.equippedItems[i].sprite as string
        ) as PIXI.Texture;
        const sprite = new PIXI.Sprite(texture);
        sprite.x = 0;
        sprite.y = 0;

        const text = new PIXI.Text({
          text: this.equippedItems[i].name,
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
    this.equipItem(itemIndex);
    this.displayInventory();
    this.displayEquipped();
  }

  unequip(itemIndex: number) {
    console.log(itemIndex);
    this.unequipItem(itemIndex);
    this.displayInventory();
    this.displayEquipped();
  }

  pickUp(item: Item | Weapon, action: boolean) {
    if (action) {
      if (this.items.length < this.inventorySize) {
        this.items.push(item);
      }
      this.displayInventory();
      this.displayEquipped();
    }
  }

  drop(itemIndex: number) {
    this.items.splice(itemIndex, 1);
    this.displayInventory();
    this.displayEquipped();
  }

  equipItem(itemIndex: number) {
    const item = this.items[itemIndex];
    if (item) {
      switch (item.category) {
        case 'weapon':
          if (this.equippedWeapon === null && item instanceof Weapon) {
            this.equippedItems.push(item);
            this.equippedWeapon = item;
            this.items.splice(itemIndex, 1);
          }
          break;
        default:
          break;
      }
    }
  }

  unequipItem(itemIndex: number) {
    const item = this.equippedItems[itemIndex];
    if (item) {
      this.items.push(item);
      if (item instanceof Weapon && this.equippedWeapon === item) {
        this.equippedWeapon = null;
      }
      this.equippedItems.splice(itemIndex, 1);
    }
  }

  getItems(): Item[] {
    return this.items;
  }

  // getEquippedItems(): Item[] {
  //   return this.equippedItems;
  // }
}
