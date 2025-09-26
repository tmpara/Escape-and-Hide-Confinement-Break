import { Component, ElementRef, ViewChild } from '@angular/core';
import { Item } from './item';
import { Inventory } from './inventory';
import * as PIXI from 'pixi.js';
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent {
  @ViewChild('inventoryContainer', { static: true}) containerRef!: ElementRef<HTMLDivElement>;
  app!: PIXI.Application;
  inventory: Inventory = new Inventory();

  async ngAfterViewInit() {
    this.app = new PIXI.Application();
    await this.app.init({
      width: 800,
      height: 800,
      backgroundColor: 0x1099bb,
    });
    this.containerRef.nativeElement.appendChild(this.app.canvas);
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

  pickUp(itemName: string) {
    this.inventory.addItem(itemName);
    this.display();
  }

  drop(itemIndex: number) {
    this.inventory.removeItem(itemIndex);
    this.display();
  }
}
