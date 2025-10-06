import { AfterViewInit, ViewChild, ElementRef, Component } from '@angular/core';
import { GameController } from './game.controller';
import { InventoryComponent } from './inventory/inventory.component';
import * as PIXI from 'pixi.js';

@Component({
  standalone: true,
  selector: 'app-game',
  imports: [ InventoryComponent],
  templateUrl: `./app.component.html`,
  styleUrl: `./app.component.css`,
})
export class GameComponent implements AfterViewInit {
  @ViewChild('gameContainer', { static: true }) containerRef!: ElementRef;
  gameController = new GameController();

  async ngAfterViewInit(): Promise<void> {
    await this.gameController.init(this.containerRef.nativeElement);


  }

}