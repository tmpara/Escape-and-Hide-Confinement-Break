import { Application } from 'pixi.js';
import { GameGrid } from './grid';
import { Player } from './player';
import { TestObject } from './testobject';
import * as PIXI from 'pixi.js';

export class GameController {
  app!: Application;
  grid!: GameGrid;
  players!: Map<string, Player>;
  localPlayerId!: string;

  constructor() {
    // Nothing in constructor now
  }

  async init(container: HTMLDivElement): Promise<void> {
    this.app = new Application({ width: 320, height: 320 });

    await this.app.init(); // ✅ Wait for Pixi to be ready

    container.appendChild(this.app.renderer.view.canvas as unknown as HTMLCanvasElement);

    this.grid = new GameGrid(32, 32);
    this.players = new Map();

    this.drawGrid();
    this.setupInputHandlers();
  }


  addLocalPlayer(id: string, x: number, y: number) {
    const player = new Player(id, x, y);
    this.app.stage.addChild(player.sprite);
    this.players.set(id, player);
    this.grid.addPlayer(id, x, y);
    this.localPlayerId = id;
  }

  addTestObject(x: number, y: number) {
    const testObject = new TestObject(x, y);
    this.app.stage.addChild(testObject.sprite);
  }

  setupInputHandlers(): void {
    window.addEventListener('keydown', (e) => this.handleKey(e));

    // Pixi v7+ input handling
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on('pointerdown', (event) => {
      const pos = event.getLocalPosition(this.app.stage);
      const gridX = Math.floor(pos.x / 32);
      const gridY = Math.floor(pos.y / 32);
      this.tryMoveTo(gridX, gridY);
    });
  }

  handleKey(e: KeyboardEvent): void {
    const directions: { [key: string]: [number, number] } = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };

    const move = directions[e.key];
    if (!move) return;

    if (this.grid.movePlayer(this.localPlayerId, move[0], move[1])) {
      const p = this.players.get(this.localPlayerId);
      const gridPos = this.grid.players.get(this.localPlayerId)!;
      p?.setGridPosition(gridPos.x, gridPos.y);
    }
  }

  tryMoveTo(x: number, y: number): void {
    const player = this.grid.players.get(this.localPlayerId);
    if (!player) return;

    const dx = x - player.x;
    const dy = y - player.y;

    if ((Math.abs(dx) === 1 && dy === 0) || (Math.abs(dy) === 1 && dx === 0)) {
      if (this.grid.movePlayer(this.localPlayerId, dx, dy)) {
        const p = this.players.get(this.localPlayerId);
        const gridPos = this.grid.players.get(this.localPlayerId)!;
        p?.setGridPosition(gridPos.x, gridPos.y);
      }
    }
  }
  drawGrid(): void {
  const lineColor = 0xcccccc;
  const tileSize = 32;
  const gridSize = 10;

  const gridGraphics = new PIXI.Graphics();
  gridGraphics.lineStyle(1, lineColor);

  for (let i = 0; i <= gridSize; i++) {
    // Vertical lines
    gridGraphics.moveTo(i * tileSize, 0);
    gridGraphics.lineTo(i * tileSize, gridSize * tileSize);

    // Horizontal lines
    gridGraphics.moveTo(0, i * tileSize);
    gridGraphics.lineTo(gridSize * tileSize, i * tileSize);
  }

  this.app.stage.addChild(gridGraphics);
}

}
