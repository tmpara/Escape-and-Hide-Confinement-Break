import * as PIXI from 'pixi.js';

export class TestObject {
  sprite: PIXI.Graphics;
  gridX: number;
  gridY: number;
  hasCollision = true;

  constructor(x: number, y: number) {
    this.gridX = x;
    this.gridY = y;

    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0xff0000); // red
    this.sprite.drawRect(0, 0, 32, 32);
    this.sprite.endFill();
    this.sprite._zIndex = 0.5;

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