import { Application, Graphics, Container } from 'pixi.js';
import { GameGrid } from './grid';
import { Player } from './player';



export class GameController {
  app!: Application;
  map!: GameGrid;
  player1 = new Player(1, 1, "1");
  gridContainer = new Container();
  playerSprite = new Graphics();

  tileSize = 40; // Size of each tile in pixels

  constructor() {}

  async init(container: HTMLDivElement): Promise<void> {
    // Create PIXI app
    this.app = new Application();
    await this.app.init({
      width: 400,
      height: 400,
      backgroundColor: 0x222222,
      antialias: true,
    });
    container.appendChild(this.app.canvas as HTMLCanvasElement);

    // Create map and player
    this.map = new GameGrid(10, 10);
    this.map.CreateEmptyMap();
    this.map.LoadPlayer(1, 1, this.player1);

    // Draw grid and player
    this.drawGrid();
    this.drawPlayer();

    // Add containers to stage
    this.app.stage.addChild(this.gridContainer);
    this.app.stage.addChild(this.playerSprite);

    // Listen for movement
    this.listenForMovement(this.player1);

    // Start game loop
    this.gameLoop();
  }

  drawGrid() {
    this.gridContainer.removeChildren();
    for (let x = 0; x < this.map.width; x++) {
      for (let y = 0; y < this.map.height; y++) {
        const tile = new Graphics();
        tile.lineStyle(1, 0x888888);
        tile.beginFill(this.map.Tiles[x][y].hasCollision ? 0x444444 : 0xcccccc);
        tile.drawRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
        tile.endFill();
        this.gridContainer.addChild(tile);
      }
    }
  }

  drawPlayer() {
    this.playerSprite.clear();
    this.playerSprite.beginFill(0x00ff00);
    this.playerSprite.drawCircle(
      this.player1.PosX * this.tileSize + this.tileSize / 2,
      this.player1.PosY * this.tileSize + this.tileSize / 2,
      this.tileSize / 3
    );
    this.playerSprite.endFill();
  }

  gameLoop() {
    // Redraw player at new position
    this.drawPlayer();
    requestAnimationFrame(() => this.gameLoop());
  }

  TryToMovePlayer(player: Player, targetX: number, targetY: number) {
    let playerPosX = player.PosX;
    let playerPosY = player.PosY;

    let deltaX = Math.abs(targetX - playerPosX);
    let deltaY = Math.abs(targetY - playerPosY);

    // Bounds and collision check
    if (
      targetX < 0 ||
      targetY < 0 ||
      targetX >= this.map.width ||
      targetY >= this.map.height ||
      this.map.Tiles[targetX][targetY].hasCollision ||
      deltaX + deltaY > 1
    ) {
      console.log("Collision detected or too far away or out of bounds");
      
    }
    else{

    this.map.Tiles[playerPosX][playerPosY].entity = null;
    player.PosX = targetX;
    player.PosY = targetY;
    this.map.Tiles[targetX][targetY].entity = player;
    }
  }

  listenForMovement(player: Player) {
    window.addEventListener('keydown', (event) => {
      let targetX = player.PosX;
      let targetY = player.PosY;

      switch (event.key.toLowerCase()) {
        case 'w':
          targetY -= 1;
          break;
        case 'a':
          targetX -= 1;
          break;
        case 's':
          targetY += 1;
          break;
        case 'd':
          targetX += 1;
          break;
        default:
          return;
      }

      this.TryToMovePlayer(player, targetX, targetY);
    });
  }
}