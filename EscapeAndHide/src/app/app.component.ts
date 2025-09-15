import { AfterViewInit, ViewChild, ElementRef, Component } from '@angular/core';
import { GameController } from './game.controller'; // adjust path
import * as PIXI from 'pixi.js';

@Component({
  standalone: true,
  selector: 'app-game',
  template: `<div #gameContainer></div>`,
  styles: [`
    div {
   
    }
  `]
})
export class GameComponent implements AfterViewInit {
  @ViewChild('gameContainer', { static: true }) containerRef!: ElementRef;
  gameController = new GameController();

  async ngAfterViewInit(): Promise<void> {
    await this.gameController.init(this.containerRef.nativeElement);

    this.gameController.addLocalPlayer('player1', 1, 1);
    this.gameController.addTestObject(4, 4);
  }

}