import * as PIXI from 'pixi.js';
import { World } from './world';

export class WorldMapRenderer {
  container: PIXI.Container;
  world: World;
  cellSize: number;
  padding: number;
  graphics: PIXI.Graphics;
  playerX?: number;
  playerY?: number;

  constructor(
    container: PIXI.Container,
    world: World,
    cellSize = 48,
    padding = 4
  ) {
    this.container = container;
    this.world = world;
    this.cellSize = cellSize;
    this.padding = padding;
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);
  }

  clear() {
    this.graphics.clear();
  }

  draw() {
    this.graphics.clear();

    const w = this.world.width;
    const h = this.world.height;

    // background
    this.graphics.beginFill(0x0b0b0b, 0.6);
    this.graphics.drawRect(0, 0, w * this.cellSize, h * this.cellSize);
    this.graphics.endFill();

    // draw room cells
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const px = x * this.cellSize + this.padding;
        const py = y * this.cellSize + this.padding;
        const size = this.cellSize - this.padding * 2;

        const roomId = this.world.roomsIDs[x]
          ? this.world.roomsIDs[x][y]
          : undefined;

        // room background
        const hasRoom = !!roomId;
        const fill = hasRoom ? 0xffffff : 0x333333;
        this.graphics.beginFill(fill, hasRoom ? 0.9 : 0.4);
        this.graphics.lineStyle(1, 0x222222, 1);
        this.graphics.drawRect(px, py, size, size);
        this.graphics.endFill();
      }
    }

    // draw connections for every room cell (each connection drawn once)
    this.graphics.lineStyle(
      Math.max(2, Math.floor(this.cellSize / 8)),
      0x66ff66,
      1
    );
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const roomId = this.world.roomsIDs[x]
          ? this.world.roomsIDs[x][y]
          : undefined;
        if (!roomId) continue;

        const entrances =
          (this.world.getRoomEntrances(roomId as any) as string[]) || [];
        // center point of this minimap cell
        const cx = x * this.cellSize + this.cellSize / 2;
        const cy = y * this.cellSize + this.cellSize / 2;

        for (const dir of entrances) {
          let nx = x;
          let ny = y;
          if (dir === 'left') nx = x - 1;
          else if (dir === 'right') nx = x + 1;
          else if (dir === 'up') ny = y - 1;
          else if (dir === 'down') ny = y + 1;

          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const neighborId = this.world.roomsIDs[nx]
            ? this.world.roomsIDs[nx][ny]
            : undefined;
          if (!neighborId) continue;

          // draw each connection only once (skip if neighbor is before current in iteration)
          if (nx < x || (nx === x && ny < y)) continue;

          const ncx = nx * this.cellSize + this.cellSize / 2;
          const ncy = ny * this.cellSize + this.cellSize / 2;

          this.graphics.moveTo(cx, cy);
          this.graphics.lineTo(ncx, ncy);
        }
      }
    }

    // draw player marker if present
    if (this.playerX !== undefined && this.playerY !== undefined) {
      const px = this.playerX * this.cellSize + this.padding;
      const py = this.playerY * this.cellSize + this.padding;
      const size = this.cellSize - this.padding * 2;
      this.graphics.beginFill(0x0000ff, 1);
      this.graphics.drawRect(px + size / 4, py + size / 4, size / 2, size / 2);
      this.graphics.endFill();
    }
  }

  // redraw (alias)
  update() {
    this.draw();
  }

  setPlayer(worldX: number, worldY: number) {
    this.playerX = worldX;
    this.playerY = worldY;
  }

  destroy() {
    this.graphics.destroy({ children: true });
    this.container.removeChild(this.graphics);
  }
}
