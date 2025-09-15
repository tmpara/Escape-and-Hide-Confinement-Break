import * as PIXI from 'pixi.js';

export class Player {
  id: string;
  sprite: PIXI.Graphics;
  gridX: number;
  gridY: number;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.gridX = x;
    this.gridY = y;

    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0x0000ff); // blue
    this.sprite.drawRect(0, 0, 32, 32);
    this.sprite.endFill();

    this.updatePosition();
  }

  updatePosition(): void {
    this.sprite.x = this.gridX * 32;
    this.sprite.y = this.gridY * 32;
  }

  setGridPosition(x: number, y: number): void {
    this.gridX = x;
    this.gridY = y;
    this.updatePosition();
  }
}
