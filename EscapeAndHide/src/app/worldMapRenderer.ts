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

  constructor(container: PIXI.Container, world: World, cellSize = 48, padding = 4) {
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

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const px = x * this.cellSize + this.padding;
        const py = y * this.cellSize + this.padding;
        const size = this.cellSize - this.padding * 2;

        const roomId = this.world.roomsIDs[x] ? this.world.roomsIDs[x][y] : undefined;

        // room background
        const hasRoom = !!roomId;
        const fill = hasRoom ? 0xffffff : 0x333333;
        this.graphics.beginFill(fill, hasRoom ? 0.9 : 0.4);
        this.graphics.lineStyle(1, 0x222222, 1);
        this.graphics.drawRect(px, py, size, size);
        this.graphics.endFill();

        if (!hasRoom) continue;

        // draw entrance markers based on the room's entrance list
        const entrances = this.world.getRoomEntrances(roomId as any) as string[];
        const markLen = Math.floor(size * 0.28);
        const cx = px + size / 2;
        const cy = py + size / 2;

        this.graphics.lineStyle(2, 0x44cc44, 1);

        if (entrances.includes('up')) {
          this.graphics.moveTo(cx - markLen / 2, py);
          this.graphics.lineTo(cx + markLen / 2, py);
        }
        if (entrances.includes('down')) {
          this.graphics.moveTo(cx - markLen / 2, py + size);
          this.graphics.lineTo(cx + markLen / 2, py + size);
        }
        if (entrances.includes('left')) {
          this.graphics.moveTo(px, cy - markLen / 2);
          this.graphics.lineTo(px, cy + markLen / 2);
        }
        if (entrances.includes('right')) {
          this.graphics.moveTo(px + size, cy - markLen / 2);
          this.graphics.lineTo(px + size, cy + markLen / 2);
        }
        // draw connectors to neighbours when both rooms have matching entrances
        this.graphics.lineStyle(Math.max(2, Math.floor(size * 0.18)), 0x44cc44, 1);
        // right connector (draw only if neighbour exists and has left entrance)
        if (x < w - 1) {
          const rightId = this.world.roomsIDs[x + 1] ? this.world.roomsIDs[x + 1][y] : undefined;
          if (rightId) {
            const rightEntr = this.world.getRoomEntrances(rightId as any) as string[];
            if (entrances.includes('right') && rightEntr.includes('left')) {
              const x1 = px + size; // current right edge (inner)
              const x2 = (x + 1) * this.cellSize + this.padding; // neighbour left edge (inner)
              this.graphics.moveTo(x1, cy);
              this.graphics.lineTo(x2, cy);
            }
          }
        }
        // down connector (draw only if neighbour exists and has up entrance)
        if (y < h - 1) {
          const downId = this.world.roomsIDs[x] ? this.world.roomsIDs[x][y + 1] : undefined;
          if (downId) {
            const downEntr = this.world.getRoomEntrances(downId as any) as string[];
            if (entrances.includes('down') && downEntr.includes('up')) {
              const y1 = py + size; // current bottom edge
              const y2 = (y + 1) * this.cellSize + this.padding; // neighbour top edge
              this.graphics.moveTo(cx, y1);
              this.graphics.lineTo(cx, y2);
            }
          }
        }
        
        // draw player marker if present
        if (this.playerX === x && this.playerY === y) {
          const pr = Math.max(2, Math.floor(size * 0.22));
          this.graphics.beginFill(0xff3333, 1);
          this.graphics.drawCircle(cx, cy, pr);
          this.graphics.endFill();
          // small white center
          this.graphics.beginFill(0xffffff, 1);
          this.graphics.drawCircle(cx, cy, Math.max(1, Math.floor(pr / 3)));
          this.graphics.endFill();
        }
      }
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
