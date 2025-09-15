import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import * as PIXI from 'pixi.js';
import { AppComponent } from '../app.component';
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent implements AfterViewInit {
  @ViewChild('pixiContainer', { static: false }) pixiContainer!: ElementRef;
  @Input() visible = false;
  app!: PIXI.Application;

  ngAfterViewInit(): void {
    const app = new PIXI.Application();
    app.init();
    this.pixiContainer.nativeElement.appendChild(
      this.app.view as HTMLCanvasElement
    );

    this.drawInventory();
  }

  drawInventory() {
    const inventorySize = 20;
    const cellSize = 2;

    for (let i = 0; i < inventorySize; i++) {
      for (let j = 0; j < inventorySize; j++) {
        const cell = new PIXI.Graphics();
        cell.lineStyle(2, 'red');
        cell.beginFill('blue');
        cell.rect(i * cellSize, j * cellSize, cellSize, cellSize);
        cell.endFill();
        this.app.stage.addChild(cell);
      }
    }
  }
}
