import { Dummy, HeavyDummy } from '../enemyTypes';
import { Item, Items } from '../items/items';
import { Weapon } from '../items/items';
import { GameGrid } from '../grid';
import { GameController } from '../game.controller';
import { Player } from '../player';
import * as PIXI from 'pixi.js';

export class Inventory {
  items: Item[] = [];
  equippedItems: Item[] = [];
  equippedWeapon: Weapon | null = null;
  inventorySize: number = 10;
  maxEquippedItems: number = 2;
  inventoryApp!: PIXI.Application;
  equippedApp!: PIXI.Application;
  inventoryContainer: HTMLDivElement;
  equippedContainer: HTMLDivElement;
  pickUpOverlay: HTMLDivElement | null = null;
  lootOverlay: HTMLDivElement | null = null;
  itemActionOverlay: HTMLDivElement | null = null;
  floorActionOverlay: HTMLDivElement | null = null;

  constructor(invContainer: HTMLDivElement, equippedContainer: HTMLDivElement) {
    this.inventoryContainer = invContainer;
    this.equippedContainer = equippedContainer;
    this.initInventory();
    this.initEquipped();
  }

  async initInventory() {
    this.inventoryApp = new PIXI.Application();
    await this.inventoryApp.init({
      width: window.innerWidth * 0.15,
      height: window.innerHeight * 0.7,
      backgroundColor: 0x1099bb,
    });
    this.inventoryContainer.appendChild(
      this.inventoryApp.canvas as HTMLCanvasElement
    );
    this.displayInventory();
  }

  async initEquipped() {
    this.equippedApp = new PIXI.Application();
    await this.equippedApp.init({
      width: window.innerWidth * 0.15,
      height: window.innerHeight * 0.7,
      backgroundColor: 0x333399,
    });
    this.equippedContainer.appendChild(
      this.equippedApp.canvas as HTMLCanvasElement
    );
    this.equipTabDisplay();
  }

  displayInventory() {
    this.inventoryApp.stage.removeChildren();
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
        text.onclick = () => {
          const globalPos = text.getGlobalPosition();
          const canvasRect = (
            this.inventoryApp.view as HTMLCanvasElement
          ).getBoundingClientRect();
          const scaleX = canvasRect.width / this.inventoryApp.screen.width;
          const scaleY = canvasRect.height / this.inventoryApp.screen.height;
          const screenX = canvasRect.left + globalPos.x * scaleX;
          const screenY = canvasRect.top + globalPos.y * scaleY;
          this.itemActionPrompt(this.items[i], screenX, screenY);
        };

        const itemContainer = new PIXI.Container();
        itemContainer.x = 10;
        itemContainer.y = 10 + i * 35;
        itemContainer.addChild(sprite);
        itemContainer.addChild(text);
        this.inventoryApp.stage.addChild(itemContainer);
      }
    }
  }

  equipTabDisplay() {
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
        text.onclick = () => {
          const globalPos = text.getGlobalPosition();
          const canvasRect = (
            this.equippedApp.view as HTMLCanvasElement
          ).getBoundingClientRect();
          const scaleX = canvasRect.width / this.equippedApp.screen.width;
          const scaleY = canvasRect.height / this.equippedApp.screen.height;
          const screenX = canvasRect.left + globalPos.x * scaleX;
          const screenY = canvasRect.top + globalPos.y * scaleY;
          this.itemActionPrompt(this.equippedItems[i], screenX, screenY);
        };

        const itemContainer = new PIXI.Container();
        itemContainer.x = 10;
        itemContainer.y = 10 + i * 40;
        itemContainer.addChild(sprite);
        itemContainer.addChild(text);
        this.equippedApp.stage.addChild(itemContainer);
      }
    }
  }

  hidePickUpPrompt() {
    if (this.pickUpOverlay) {
      this.pickUpOverlay.remove();
      this.pickUpOverlay = null;
    }
  }

  showPickUpPrompt(item: Item): Promise<boolean> {
    if (this.pickUpOverlay) {
      return Promise.resolve(false);
    }
    this.pickUpPopupStyles();

    const overlay = document.createElement('div');
    overlay.className = 'pickup-overlay';

    const box = document.createElement('div');
    box.className = 'pickup-box';

    const title = document.createElement('div');
    title.className = 'prompt-title';
    title.textContent = 'Pick up ' + item.name + '?';

    // const name = document.createElement('div');
    // name.className = 'prompt-item-name';
    // name.textContent = item.name;

    // const msg = document.createElement('div');
    // msg.className = 'prompt-msg';
    // msg.textContent = ''; used for errors like "Inventory full"

    const buttons = document.createElement('div');
    buttons.className = 'prompt-buttons';

    const confirm = document.createElement('button');
    confirm.className = 'prompt-btn confirm';
    confirm.textContent = 'Yes';

    const cancel = document.createElement('button');
    cancel.className = 'prompt-btn cancel';
    cancel.textContent = 'No';

    buttons.appendChild(confirm);
    buttons.appendChild(cancel);

    box.appendChild(title);
    // box.appendChild(name);
    // box.appendChild(msg);
    box.appendChild(buttons);
    overlay.appendChild(box);

    document.body.appendChild(overlay);
    this.pickUpOverlay = overlay;

    return new Promise<boolean>((resolve) => {
      confirm.onclick = () => {
        this.hidePickUpPrompt();
        resolve(true);
      };
      cancel.onclick = () => {
        this.hidePickUpPrompt();
        resolve(false);
      };

      overlay.onclick = (e) => {
        if (e.target === overlay) {
          this.hidePickUpPrompt();
          resolve(false);
        }
      };
    });
  }

  hideLootPopup() {
    if (this.lootOverlay) {
      this.lootOverlay.remove();
      this.lootOverlay = null;
    }
  }

  showLootPopup(entity: any) {
    if (this.lootOverlay) {
      return Promise.resolve(false);
    }
    this.lootPopupStyles();

    const overlay = document.createElement('div');
    overlay.className = 'loot-overlay';

    const box = document.createElement('div');
    box.className = 'loot-box';

    const title = document.createElement('div');
    title.className = 'loot-title';
    title.textContent = entity.name;

    const itemLootBox = document.createElement('div');
    itemLootBox.className = 'item-loot box';

    for (let i = 0; i < entity.lootTable.length; i++) {
      const item = entity.lootTable[i];
      const itemButton = document.createElement('button');
      itemButton.className = 'loot-item-btn';
      itemButton.textContent = item.name;
      itemButton.onclick = () => {
        this.pickUp(item);
        itemButton.disabled = true;
        entity.lootTable.splice(i, 1);
        itemLootBox.removeChild(itemButton);
      };
      itemLootBox.appendChild(itemButton);
    }

    const buttons = document.createElement('div');
    buttons.className = 'loot-buttons';

    const close = document.createElement('button');
    close.className = 'loot-btn close';
    close.textContent = 'Close';

    buttons.appendChild(close);

    box.appendChild(title);
    box.appendChild(itemLootBox);
    box.appendChild(buttons);
    overlay.appendChild(box);

    document.body.appendChild(overlay);
    this.lootOverlay = overlay;

    return new Promise<boolean>((resolve) => {
      close.onclick = () => {
        this.hideLootPopup();
      };

      overlay.onclick = (e) => {
        if (e.target === overlay) {
          this.hideLootPopup();
        }
      };
    });
  }

  itemActionPrompt(item: Item, screenX?: number, screenY?: number) {
    if (this.itemActionOverlay) {
      return;
    }
    this.itemActionPromptStyles();
    const overlay = document.createElement('div');
    overlay.className = 'item-action-overlay';

    const box = document.createElement('div');
    box.className = 'item-action-box';

    const equipButton = document.createElement('button');
    equipButton.className = 'item-action-equip-btn';

    const dropButton = document.createElement('button');
    dropButton.className = 'item-action-drop-btn';
    dropButton.textContent = 'Drop';

    if (item.isEquipped) {
      equipButton.textContent = 'Unequip';
      equipButton.onclick = () => {
        const itemIndex = this.equippedItems.indexOf(item);
        if (itemIndex !== -1) {
          this.unequip(itemIndex);
        }
      };
      dropButton.onclick = () => {
        const itemIndex = this.equippedItems.indexOf(item);
        if (itemIndex !== -1) {
          this.drop(itemIndex, true);
        }
      };
    } else {
      equipButton.textContent = 'Equip';
      equipButton.onclick = () => {
        const itemIndex = this.items.indexOf(item);
        if (itemIndex !== -1) {
          this.equip(itemIndex);
        }
      };
      dropButton.onclick = () => {
        const itemIndex = this.items.indexOf(item);
        if (itemIndex !== -1) {
          this.drop(itemIndex, false);
        }
      };
    }

    box.appendChild(equipButton);
    box.appendChild(dropButton);
    overlay.appendChild(box);

    if (typeof screenX === 'number' && typeof screenY === 'number') {
      box.style.position = 'absolute';
      box.style.left = `${Math.max(8, Math.round(screenX + 8))}px`;
      box.style.top = `${Math.max(8, Math.round(screenY + 8))}px`;
    }

    document.body.appendChild(overlay);
    this.itemActionOverlay = overlay;

    return new Promise<boolean>((resolve) => {
      overlay.onclick = () => {
        this.hideItemActionPrompt();
        resolve(true);
      };
    });
  }

  hideItemActionPrompt() {
    if (this.itemActionOverlay) {
      this.itemActionOverlay.remove();
      this.itemActionOverlay = null;
    }
  }

  floorItemActionPrompt(x: number, y: number) {
    if (this.floorActionOverlay) {
      return;
    }
    this.floorItemActionPromptStyles();
    const overlay = document.createElement('div');
    overlay.className = 'item-action-overlay';

    const box = document.createElement('div');
    box.className = 'item-action-box';

    const pickUpButton = document.createElement('button');
    pickUpButton.className = 'item-action-pickup-btn';

    pickUpButton.textContent = 'Pick Up';
    pickUpButton.onclick = () => {};

    box.appendChild(pickUpButton);
    overlay.appendChild(box);

    if (typeof screenX === 'number' && typeof screenY === 'number') {
      box.style.position = 'absolute';
      box.style.left = `${Math.max(8, Math.round(screenX + 8))}px`;
      box.style.top = `${Math.max(8, Math.round(screenY + 8))}px`;
    }

    document.body.appendChild(overlay);
    this.floorActionOverlay = overlay;

    return new Promise<boolean>((resolve) => {
      pickUpButton.onclick = () => {
        const tile = GameController.current?.map.tiles[x][y];
        if (tile && tile.item) {
          this.pickUp(tile.item);
        }
        this.hideFloorItemActionPrompt();
        resolve(true);
      };
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          this.hideFloorItemActionPrompt();
          resolve(false);
        }
      };
    });
  }

  hideFloorItemActionPrompt() {
    if (this.floorActionOverlay) {
      this.floorActionOverlay.remove();
      this.floorActionOverlay = null;
    }
  }

  itemActionPromptStyles() {
    const style = document.createElement('style');
    style.id = 'inventory-prompt-styles';
    style.textContent = `
      .item-action-overlay {
        position: fixed;
        left: 0; top: 0; right: 0; bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
      }
      .item-action-box {
        background: #121212;  
        color: #fff;
        border-radius: 8px;
        width: 120px;
        max-width: calc(100% - 40px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        text-align: center;
        font-family: Arial, Helvetica, sans-serif;
      }
      .item-action-equip-btn, .item-action-drop-btn {
        width: 100%;
        border: none
        cursor: pointer;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }

  floorItemActionPromptStyles() {
    const style = document.createElement('style');
    style.id = 'inventory-prompt-styles';
    style.textContent = `
      .item-action-overlay {
        position: fixed;
        left: 0; top: 0; right: 0; bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
      }
      .item-action-box {
        background: #121212;  
        color: #fff;
        border-radius: 8px;
        width: 120px;
        max-width: calc(100% - 40px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        text-align: center;
        font-family: Arial, Helvetica, sans-serif;
      }
      .item-action-pickup-btn {
        width: 100%;
        border: none
        cursor: pointer;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }

  pickUpPopupStyles() {
    const style = document.createElement('style');
    style.id = 'inventory-prompt-styles';
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
      .prompt-title { font-weight: 700; margin-bottom: 8px; font-size: 18px; }
      .prompt-item-name { margin: 6px 0 12px; font-size: 16px; }
      .prompt-sprite img { max-width: 64px; max-height: 64px; display:block; margin: 0 auto 8px; }
      .prompt-msg { min-height: 18px; margin-bottom: 8px; font-size: 14px; }
      .prompt-buttons { display:flex; gap: 8px; justify-content:center; }
      .prompt-btn {
        padding: 8px 12px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 14px;
      }
      .prompt-btn.confirm { background: #2e8b57; color: white; }
      .prompt-btn.cancel { background: #444; color: white; }
    `;
    document.head.appendChild(style);
  }

  lootPopupStyles() {
    const style = document.createElement('style');
    style.id = 'inventory-prompt-styles';
    style.textContent = `
      .loot-overlay {
        position: fixed;
        left: 0; top: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
      }
      .loot-box {
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
      .loot-title { font-weight: 700; margin-bottom: 8px; font-size: 18px; }
      .loot-item-btn { height: 32px; margin-top: 4px; margin-bottom: 8px;}
      .loot-buttons { display:flex; gap: 8px; justify-content:center; }
      .loot-btn {
        padding: 8px 12px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 14px;
      }
      .loot-btn.close { background: #2e8b57; color: white; }
    `;
    document.head.appendChild(style);
  }

  equip(index: number) {
    const item = this.items[index];
    item.isEquipped = true;
    if (item) {
      if (this.equippedItems.length < this.maxEquippedItems) {
        this.equippedItems.push(item);
        this.items.splice(index, 1);
      }
      if (item instanceof Weapon) {
        this.equippedWeapon = item;
      }
    }
    this.displayInventory();
    this.equipTabDisplay();
  }

  unequip(index: number) {
    const item = this.equippedItems[index];
    item.isEquipped = false;
    if (item) {
      this.equippedItems.splice(index, 1);
      this.items.push(item);
    }
    this.displayInventory();
    this.equipTabDisplay();
  }

  pickUp(item: Item) {
    if (this.items.length < this.inventorySize) {
      this.items.push(item);
    }
    this.displayInventory();
    this.equipTabDisplay();
  }

  drop(index: number, isEquipped: boolean) {
    const x = GameController.current?.player1.posX;
    const y = GameController.current?.player1.posY;
    let item = null;
    if (GameController.current?.map.tiles[x!][y!].item == null) {
      if (isEquipped) {
        item = this.equippedItems[index];
        item.isEquipped = false;
        this.equippedItems.splice(index, 1);
      } else {
        item = this.items[index];
        this.items.splice(index, 1);
      }
      this.displayInventory();
      this.equipTabDisplay();

      if (
        typeof x === 'number' &&
        typeof y === 'number' &&
        GameController.current?.map
      ) {
        GameController.current.spawnItem(x, y, item);
      }
    }
  }

  getItems(): Item[] {
    return this.items;
  }
}
