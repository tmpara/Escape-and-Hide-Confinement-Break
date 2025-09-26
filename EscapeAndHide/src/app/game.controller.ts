import { Application, Graphics, Container } from 'pixi.js';
import { GameGrid } from './grid';
import { Player } from './player';
import { Health } from './health/health';
import * as PIXI from 'pixi.js';
import { Text, TextStyle, Assets } from 'pixi.js';

export class GameController {
  app!: Application;
  map!: GameGrid;
  player1 = new Player(1, 1, "1", new Health(5.00, 4.00));
  gridContainer = new Container();
  playerSprite = new Graphics();
  healthBar = new Graphics();

  tileSize = 40; // Size of each tile in pixels

  constructor() {}

  async init(container: HTMLDivElement): Promise<void> {
    // Create PIXI app
    this.app = new Application();
    await this.app.init({
      width: 1000,
      height: 1000,
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
    this.drawHealthBar();
    // Add containers to stage
    this.app.stage.addChild(this.gridContainer);
    this.app.stage.addChild(this.playerSprite);
    this.app.stage.addChild(this.healthBar);

    // Listen for movement
    this.listenForMovement(this.player1);

    // Start game loop
    this.gameLoop();



   
    
  }
  
  
  drawHealthBar() {
 
    


  const myText = new Text({
    text: '' + this.player1.health.currentHealth,
    style: {
      fill: '#ffffff',
      fontSize: 36,
    },
    anchor: 0.5,
    x:100,
    y:50
  });

    this.healthBar.removeChild();
    const barWidth = 200;
    const barHeight = 20;
    const x = 10;
    const y = 500;

    // Background
    this.healthBar.beginFill(0x555555);
    this.healthBar.drawRect(x, y, barWidth, barHeight);
    this.healthBar.endFill();

    // Health
    const healthPercentage = this.player1.health.currentHealth / this.player1.health.maxHealth;

    this.healthBar.beginFill(0xff0000);
    this.healthBar.drawRect(x, y, barWidth * healthPercentage, barHeight);
    this.healthBar.addChild(myText);
   
    this.healthBar.endFill();

    // DOT effect
    if (this.player1.health.Dot > 0) {
      const dotPercentage = Math.min(this.player1.health.Dot / this.player1.health.maxHealth, 1);
      this.healthBar.beginFill(0xffff00);
      this.healthBar.drawRect(x + barWidth * healthPercentage, y, barWidth * dotPercentage, barHeight);
      this.healthBar.endFill();
    }
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
      this.player1.renderX * this.tileSize + this.tileSize / 2,
      this.player1.renderY * this.tileSize + this.tileSize / 2,
      this.tileSize / 3
    );
    this.playerSprite.endFill();
  }

  animatePlayerMove(player: Player, targetX: number, targetY: number, duration: number = 150) {
    const startX = player.renderX;
    const startY = player.renderY;
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      player.renderX = startX + deltaX * t;
      player.renderY = startY + deltaY * t;
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        player.renderX = targetX;
        player.renderY = targetY;
      }
    };
    requestAnimationFrame(animate);
  }

  gameLoop() {
    // Redraw player at new position
    this.drawPlayer();
    this.drawHealthBar();
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
  this.animatePlayerMove(player, targetX, targetY);
  this.player1.health.TriggerDot();
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