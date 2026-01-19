import { Item } from '../items/items';
import { GameController } from '../game.controller';
import * as PIXI from 'pixi.js';

export class Inventory {
  inventorySlots: (Item | null)[] = Array(10).fill(null);
  inventorySize: number = 10;
  weaponSlot: Item | null = null;
  headArmorSlot: Item | null = null;
  torsoArmorSlot: Item | null = null;
  fullbodyArmorSlot: Item | null = null;

  inventoryApp!: PIXI.Application;
  equippedApp!: PIXI.Application;
  inventoryContainer: HTMLDivElement;
  equippedContainer: HTMLDivElement;
  slotsContainer: HTMLDivElement | null = null;
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
    await PIXI.Assets.load('/placeholder.png');
    await PIXI.Assets.load('/headSlot.png');
    await PIXI.Assets.load('/torsoSlot.png');
    await PIXI.Assets.load('/fullbodySlot.png');
  }

  displayInventory() {
    this.inventoryApp.stage.removeChildren();
    for (let i = 0; i < this.inventorySlots.length; i++) {
      const item = this.inventorySlots[i];
      if (item) {
        item.displayed = false;
      }
    }

    for (let i = 0; i < this.inventorySlots.length; i++) {
      const item = this.inventorySlots[i];
      if (item && !item.displayed) {
        item.displayed = true;
        const texture = PIXI.Assets.get(item.sprite as string) as PIXI.Texture;
        const sprite = new PIXI.Sprite(texture);
        sprite.x = 0;
        sprite.y = 0;

        const text = new PIXI.Text({
          text: item.name,
          style: {
            fontFamily: 'Arial',
            fontSize: 20,
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
          this.itemActionPrompt(item, screenX, screenY);
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
    if (this.weaponSlot) {
      this.displayEquippedItem(this.weaponSlot, 'Weapon', 0);
    } else {
      this.displayEmptySlot('Weapon', 0);
    }
    if (this.headArmorSlot) {
      this.displayEquippedItem(this.headArmorSlot, 'Head Armor', 1);
    } else {
      this.displayEmptySlot('Head Armor', 1);
    }
    if (this.torsoArmorSlot) {
      this.displayEquippedItem(this.torsoArmorSlot, 'Torso Armor', 2);
    } else {
      this.displayEmptySlot('Torso Armor', 2);
    }
    if (this.fullbodyArmorSlot) {
      this.displayEquippedItem(this.fullbodyArmorSlot, 'Fullbody Armor', 3);
    } else {
      this.displayEmptySlot('Fullbody Armor', 3);
    }
  }

  displayEquippedItem(item: Item, slotName: string, slotIndex: number) {
    const texture = PIXI.Assets.get(item.sprite as string) as PIXI.Texture;
    const sprite = new PIXI.Sprite(texture);
    sprite.x = 0;
    sprite.y = 0;

    const text = new PIXI.Text({
      text: `${slotName}: ${item.name}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
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
      this.itemActionPrompt(item, screenX, screenY);
    };

    const itemContainer = new PIXI.Container();
    itemContainer.x = 10;
    itemContainer.y = 10 + slotIndex * 40;
    itemContainer.addChild(sprite);
    itemContainer.addChild(text);
    this.equippedApp.stage.addChild(itemContainer);
  }

  // Helper to display empty slot
  displayEmptySlot(slotName: string, slotIndex: number) {
    const text = new PIXI.Text({
      text: `${slotName}: empty`,
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
      },
    });
    text.anchor.set(0);
    text.x = 10;
    text.y = 0;
    const itemContainer = new PIXI.Container();
    itemContainer.x = 10;
    itemContainer.y = 10 + slotIndex * 40;
    itemContainer.addChild(text);
    this.equippedApp.stage.addChild(itemContainer);
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
        this.unequip(item);
      };
      dropButton.onclick = () => {
        this.drop(item, true);
      };
    } else {
      equipButton.textContent = 'Equip';
      equipButton.onclick = () => {
        this.equip(item);
      };
      dropButton.onclick = () => {
        this.drop(item, false);
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

  equip(item: Item) {
    // Find item in inventorySlots
    const index = this.inventorySlots.indexOf(item);
    if (index === -1) return;
    // Determine slot type
    if (item.slot === 'weapon') {
      if (!this.weaponSlot) {
        this.weaponSlot = item;
        this.inventorySlots[index] = null;
        item.isEquipped = true;
      }
    } else if (item.slot === 'head') {
      if (!this.headArmorSlot) {
        this.headArmorSlot = item;
        this.inventorySlots[index] = null;
        item.isEquipped = true;
      }
    } else if (item.slot === 'torso') {
      if (!this.torsoArmorSlot) {
        this.torsoArmorSlot = item;
        this.inventorySlots[index] = null;
        item.isEquipped = true;
      }
    } else if (item.slot === 'fullbody') {
      if (!this.fullbodyArmorSlot) {
        this.fullbodyArmorSlot = item;
        this.inventorySlots[index] = null;
        item.isEquipped = true;
      }
    }
    this.displayInventory();
    this.equipTabDisplay();
  }

  unequip(item: Item) {
    // Remove from equipped slot and add back to inventorySlots
    if (this.weaponSlot === item) {
      this.weaponSlot = null;
    } else if (this.headArmorSlot === item) {
      this.headArmorSlot = null;
    } else if (this.torsoArmorSlot === item) {
      this.torsoArmorSlot = null;
    } else if (this.fullbodyArmorSlot === item) {
      this.fullbodyArmorSlot = null;
    }
    item.isEquipped = false;
    // Find first empty slot in inventorySlots
    const emptyIndex = this.inventorySlots.indexOf(null);
    if (emptyIndex !== -1) {
      this.inventorySlots[emptyIndex] = item;
    }
    this.displayInventory();
    this.equipTabDisplay();
  }

  pickUp(item: Item) {
    const emptyIndex = this.inventorySlots.indexOf(null);
    if (emptyIndex !== -1) {
      this.inventorySlots[emptyIndex] = item;
    }
    this.displayInventory();
    this.equipTabDisplay();
  }

  drop(item: Item, isEquipped: boolean) {
    const x = GameController.current?.player1.posX;
    const y = GameController.current?.player1.posY;
    if (typeof x !== 'number' || typeof y !== 'number') return;
    if (GameController.current?.map.tiles[x][y].item == null) {
      if (isEquipped) {
        // Remove from equipped slot
        this.unequip(item);
      } else {
        // Remove from inventorySlots
        const index = this.inventorySlots.indexOf(item);
        if (index !== -1) {
          this.inventorySlots[index] = null;
        }
      }
      this.displayInventory();
      this.equipTabDisplay();
      if (GameController.current) {
        GameController.current.spawnItem(x, y, item);
      }
    }
  }

  getItems(): Item[] {
    // Return all non-null items in inventorySlots
    return this.inventorySlots.filter((item): item is Item => item !== null);
  }

  getEquippedWeapon() {
    return this.weaponSlot;
  }
}
