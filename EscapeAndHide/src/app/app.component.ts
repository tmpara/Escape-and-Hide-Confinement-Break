import { AfterViewInit, ViewChild, ElementRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameController } from './game.controller';
import { InventoryComponent } from './inventory/inventory.component';
import * as PIXI from 'pixi.js';
import { RoomEditorComponent } from './room-editor/room-editor.component';

@Component({
  standalone: true,
  selector: 'app-game',
  imports: [ CommonModule, InventoryComponent, RoomEditorComponent],
  templateUrl: `./app.component.html`,
  styleUrl: `./app.component.css`,
})
export class GameComponent implements AfterViewInit {
  
  @ViewChild('gameContainer', { static: true }) containerRef!: ElementRef;
  gameController = new GameController();
  showEditor: boolean = false; // set true temporarily to debug UI visibility

  toggleEditor() {
    console.log('toggleEditor called, previous=', this.showEditor);
    this.showEditor = !this.showEditor;
    console.log('toggleEditor new=', this.showEditor);
  }

  async ngAfterViewInit(): Promise<void> {
    await this.gameController.init(this.containerRef.nativeElement);
  }

}