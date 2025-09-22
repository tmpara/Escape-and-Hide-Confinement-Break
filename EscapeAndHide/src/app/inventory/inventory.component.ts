import { Component } from '@angular/core';
import { Item } from './item';
import * as PIXI from 'pixi.js';
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent {
  app!: PIXI.Application;

  items: Item[] = [];

  async ngAfterViewInit() {
    this.app = new PIXI.Application();
    await this.app.init({
      width: 800,
      height: 800,
      backgroundColor: 0x1099bb,
    });
    document.body.append(this.app.canvas);
    this.display();
  }

  display() {
    this.app.stage.removeChildren();
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].displayed = false;
    }

    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i].displayed) {
        this.items[i].displayed = true;
        const text = new PIXI.Text({
          text: this.items[i].name,
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

  pickUp(itemName: string) {
    this.items.push(new Item(itemName, false));
    this.display();
  }
  drop(itemIndex: number) {
    this.items.splice(itemIndex, 1);
    this.app.stage.removeChildren(itemIndex, itemIndex + 1);
    this.display();
  }
}
