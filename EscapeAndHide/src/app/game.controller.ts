import { Application, Graphics, Container } from 'pixi.js';
import { GameGrid } from './grid';
import { Player } from './player';
import { Health } from './health/health';
import { Text, Sprite, Assets } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { Energy } from './energy/energy';
import { effect } from '@angular/core';
import { Items } from './inventory/items';
import { inventoryRendering } from './inventory/inventoryRendering';

export class GameController {
  app!: Application;
  map!: GameGrid;
  inventory!: inventoryRendering;
  player1 = new Player(1, 1, '1', new Health(5.0, 4.0), new Energy(100, 100));
  gridContainer = new Container();
  playerSprite = new Graphics();
  healthBar = new Graphics();
  energyBar = new Graphics();
  tile = new Graphics();
  tileSize = 64; // Size of each tile in pixels

  constructor() {}

  async init(container: HTMLDivElement): Promise<void> {
    await Assets.load(
      'https://art.pixilart.com/sr24d0c9ad1eded.png'
    );
    await Assets.load('placeholder.png');
    await Assets.load('gun.png');

    // Create PIXI app
    this.app = new Application();
    await this.app.init({
      width: 896,
      height: 896,
      backgroundColor: 0x222222,
      antialias: true,
    });
    container.appendChild(this.app.canvas as HTMLCanvasElement);

    // Create map and player
    this.GenerateRoom();
    this.map.LoadPlayer(1, 1, this.player1);

    this.map.SpawnItem(1, 2, new Items().gun);
    this.map.SpawnItem(2, 2, new Items().bigGun);

    // Draw grid and player
    this.drawGrid();
    this.drawPlayer();

    // Add containers to stage
    this.app.stage.addChild(this.gridContainer);
    this.app.stage.addChild(this.playerSprite);
    this.app.stage.addChild(this.healthBar);
    this.app.stage.addChild(this.energyBar);

    // Create inventory and equipped containers side by side
    const inventoryRow = document.createElement('div');
    inventoryRow.style.display = 'flex';
    inventoryRow.style.flexDirection = 'row';
    container.appendChild(inventoryRow);

    const invDiv = document.createElement('div');
    invDiv.id = 'inventory-container';
    inventoryRow.appendChild(invDiv);

    const equippedDiv = document.createElement('div');
    equippedDiv.id = 'equipped-container';
    inventoryRow.appendChild(equippedDiv);

    // Pass both containers to inventoryRendering
    this.inventory = new inventoryRendering(invDiv, equippedDiv);

    // Listen for movement
    this.listenForInput(this.player1);
    this.listenForMovement(this.player1);

    // Start game loop
    this.gameLoop();
  }

  GenerateRoom() {
    this.map = new GameGrid(14, 14);
    this.map.CreateEmptyMap();
    this.map.CreateMap();
  }

  GenerateRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  drawHealthBar() {
    const myText = new Text({
      text: Math.round(this.player1.health.currentHealth * 100) / 100 + ' L',
      style: {
        fontSize: 20,
        fill: '#ffffff',
      },
      anchor: 0.5,
      y: 830,
      x: 100,
    });

    this.healthBar.removeChildren();
    this.healthBar.clear();
    const barWidth = 200;
    const barHeight = 20;
    const x = 10;
    const y = 820;
    // Background
    this.healthBar.drawRect(x, y, barWidth, barHeight);
    this.healthBar.beginFill(0x555555);
    this.healthBar.endFill();

    const dotPercentage = Math.min(
      this.player1.health.Dot / this.player1.health.maxHealth,
      1
    );
    const regenPercentage = Math.min(
      this.player1.health.Regeneration / this.player1.health.maxHealth,
      1
    );
    // Health
    const healthPercentage =
      this.player1.health.currentHealth / this.player1.health.maxHealth;
    this.healthBar.beginFill(0xff0000);

    this.healthBar.drawRect(x, y, barWidth * healthPercentage, barHeight);
    this.healthBar.addChild(myText);

    this.healthBar.endFill();

    // DOT effect
    if (this.player1.health.Dot > 0) {
      let dotRate = this.player1.health.DotReduceRate / 0.25;
      let dotDamage = 0.25 / this.player1.health.DotDamageRate;
      this.healthBar.beginFill(0xffff00);
      this.healthBar.drawRect(
        x + barWidth * (healthPercentage - dotPercentage / dotDamage / dotRate),
        y,
        barWidth * (dotPercentage / dotRate / dotDamage),
        barHeight
      );
      this.healthBar.endFill();
    }

    // Regeneration

    if (
      this.player1.health.Regeneration > 0 &&
      this.player1.health.currentHealth < this.player1.health.maxHealth
    ) {
      if (this.player1.health.Dot > 0) {
        this.healthBar.beginFill(0x00ff00);
        this.healthBar.drawRect(
          x + barWidth * (healthPercentage - dotPercentage),
          y,
          barWidth * regenPercentage,
          barHeight
        );
        this.healthBar.endFill();
      } else if (
        this.player1.health.currentHealth + this.player1.health.Regeneration >
        this.player1.health.maxHealth
      ) {
        const regenerationToMaxPercentage =
          (this.player1.health.maxHealth - this.player1.health.currentHealth) /
          this.player1.health.maxHealth;
        this.healthBar.beginFill(0x00ff00);
        this.healthBar.drawRect(
          x + barWidth * healthPercentage,
          y,
          barWidth * regenerationToMaxPercentage,
          barHeight
        );
        this.healthBar.endFill();
      } else {
        this.healthBar.beginFill(0x00ff00);
        this.healthBar.drawRect(
          x + barWidth * healthPercentage,
          y,
          barWidth * regenPercentage,
          barHeight
        );
        this.healthBar.endFill();
      }
    }
  }

  drawEnergyBar() {
    this.energyBar.removeChildren();
    this.energyBar.clear();
    const barWidth = 200;
    const barHeight = 20;
    const x = 10;
    const y = 860;

    // Background
    this.energyBar.beginFill(0x555555);
    this.energyBar.drawRect(x, y, barWidth, barHeight);
    this.energyBar.endFill();

    // Energy
    const energyPercentage =
      this.player1.energy.currentEnergy / this.player1.energy.maxEnergy;

    this.energyBar.beginFill(0xffff00);
    this.energyBar.drawRect(x, y, barWidth * energyPercentage, barHeight);

    this.energyBar.endFill();
  }

  drawGrid() {
    this.gridContainer.removeChildren();
    this.tile.clear();

    for (let x = 0; x < this.map.width; x++) {
      for (let y = 0; y < this.map.height; y++) {
        if (this.map.tiles[x][y].sprite != '') {
          let texture = Assets.get(this.map.tiles[x][y].sprite.toString());
          let sprite = new PIXI.Sprite(texture);
          sprite.x = x * this.tileSize;
          sprite.y = y * this.tileSize;
          sprite.width = this.tileSize;
          sprite.height = this.tileSize;
          this.gridContainer.addChild(sprite);
        } else {
          this.tile.lineStyle(1, 0x888888);
          this.tile.beginFill(0xcccccc);
          this.tile.drawRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
          this.tile.endFill();
          this.gridContainer.addChild(this.tile);
        }
        this.tile.endFill();
        this.gridContainer.addChild(this.tile);
      }
    }
  }

  drawPlayer() {
    this.playerSprite.removeChildren();
    this.playerSprite.clear();
    this.playerSprite.beginFill(0x00ff00);
    this.playerSprite.drawCircle(
      this.player1.renderX * this.tileSize + this.tileSize / 2,
      this.player1.renderY * this.tileSize + this.tileSize / 2,
      this.tileSize / 3
    );
    this.playerSprite.endFill();
  }

  animatePlayerMove(
    player: Player,
    targetX: number,
    targetY: number,
    duration: number = 150
  ) {
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
    this.drawGrid();
    this.drawPlayer();
    this.drawHealthBar();
    this.drawEnergyBar();
    requestAnimationFrame(() => this.gameLoop());
  }

  TryToMovePlayer(player: Player, targetX: number, targetY: number) {
    if (this.player1.energy.currentEnergy < 10) {
      console.log('Not enough energy');
      return;
    }

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
      this.map.tiles[targetX][targetY].hasCollision ||
      deltaX + deltaY > 1
    ) {
      console.log('Collision detected or too far away or out of bounds');
    } else {
      this.map.tiles[playerPosX][playerPosY].entity = null;
      player.PosX = targetX;
      player.PosY = targetY;
      this.map.tiles[targetX][targetY].entity = player;
      this.animatePlayerMove(player, targetX, targetY);
      this.player1.playerAction(10);
      this.checkUnderPlayer(player);
      this.checkTileForItem(player);
    }
  }

  checkTileForItem(player: Player) {
    if (this.map.tiles[player.PosX][player.PosY].hasItem) {
      const item = this.map.tiles[player.PosX][player.PosY].item;
      if (item) {
        this.inventory.pickUp(item.name, item.category, item.sprite);
        this.map.RemoveItem(player.PosX, player.PosY);
      }
    }
  }

  checkUnderPlayer(player: Player) {
    let tileEffect = this.map.tiles[player.PosX][player.PosY].effect;
    console.log('Tile effect: ' + tileEffect);
    if (tileEffect) {
      if (tileEffect == 'glass_shards') {
        player.health.Damage(0, 1.0);
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

  listenForInput(player: Player) {
    window.addEventListener('keydown', (event) => {
      switch (event.key.toLowerCase()) {
        case 'x':
          this.player1.energy.setEnergy(100);
          this.player1.playerAction(0);
          break;
        default:
          return;
      }
    });
  }
}
