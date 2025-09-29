import { Application, Graphics, Container } from 'pixi.js';
import { GameGrid } from './grid';
import { Player } from './player';
import { Health } from './health/health';
import * as PIXI from 'pixi.js';
import { Text, TextStyle, Assets } from 'pixi.js';
import { effect } from '@angular/core';

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

    // Add some tile effects for testing
    this.map.addTileEffect(2, 2, "glassShards");

    // Start game loop
    this.gameLoop();



   
    
  }
  
  
  drawHealthBar() {
 
    


  const myText = new Text({
    text: Math.round(this.player1.health.currentHealth*100)/100+ " L",
    style: {
      fill: '#ffffff',
      fontSize: 20,
    },
    anchor: 0.5,
    x:100,
    y:510
  });

    this.healthBar.removeChildren();
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
      let dotRate = this.player1.health.DotReduceRate/0.25;
      let dotDamage =0.25/this.player1.health.DotDamageRate ;
      const dotPercentage = Math.min(this.player1.health.Dot / this.player1.health.maxHealth, 1);
      this.healthBar.beginFill(0xffff00);
      this.healthBar.drawRect(x + barWidth * (healthPercentage-((dotPercentage/dotDamage)/dotRate)), y, barWidth * ((dotPercentage / dotRate) / dotDamage), barHeight);
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
  this.animatePlayerMove(player, targetX, targetY);
  this.checkUnderPlayer(player);
  player.health.TriggerDot();
    }
  }

  checkUnderPlayer(player: Player) {
    let tileEffect = this.map.Tiles[player.PosX][player.PosY].effect;
    if (tileEffect) {
      if (tileEffect == "glassShards") {
        player.health.Damage(0, 1.0)
    }

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