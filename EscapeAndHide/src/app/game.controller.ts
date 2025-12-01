import { Application, Graphics, Container } from 'pixi.js';
import { GameGrid } from './grid';
import { Player } from './player';
import { Health } from './health/health';
import { Text, Assets } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { Energy } from './energy/energy';
import { Items, Weapon } from './items/items';
import { World } from './world';
import { WeaponFunctionality } from './items/weapon_functionality';
import { Dummy, HeavyDummy } from './enemyTypes';
import { Inventory } from './inventory/inventory';

export class GameController {
  static current: GameController | null = null;
  app!: Application;
  map!: GameGrid;
  healthUIApp!: PIXI.Application;
  afflictionsApp!: PIXI.Application;
  items = new Items();
  inventory!: Inventory;
  weaponFunctionality = new WeaponFunctionality();
  player1 = new Player(1, 1, '1', new Health(5000, 5000), new Energy(100, 100));
  dummy1 = new Dummy(5, 2, '1', 1.0);
  heavyDummy1 = new HeavyDummy(5, 3, '1', 20.0);
  world = new World();
  gridContainer = new Container();
  effectContainer = new Container();
  entityContainer = new Container();
  playerSprite = new Graphics();
  healthBar = new Graphics();
  energyBar = new Graphics();
  reticleContainer = new Container();
  tile = new Graphics();
  playerWorldX = 5;
  playerWorldY = 5;
  tileSize = 32;
  aimMode: boolean = false;
  mouseX: number = 0;
  mouseY: number = 0;
  mouseTileX: number = 0;
  mouseTileY: number = 0;

  healthLimbContainer = new Container();
  limbSprites: Record<string, PIXI.Sprite> = {};
  selectedLimb: string = '';
  afflictions: any = {};

  constructor() {}

  async init(container: HTMLDivElement): Promise<void> {
    GameController.current = this;
    await Assets.load('explosion.png');
    await Assets.load('fire_legacy.png');
    await Assets.load('fire_large.png');
    await Assets.load('fire_medium.png');
    await Assets.load('fire_small.png');
    await Assets.load('placeholder.png');
    await Assets.load('door1.png');
    await Assets.load('ash.png');
    await Assets.load('gun.png');
    await Assets.load('biggun.png');
    await Assets.load('dummy.png');
    await Assets.load('dummyDead.png');
    await Assets.load('heavyDummy.png');
    await Assets.load('heavyDummyDead.png');
    await Assets.load('medkit.png');
    await Assets.load('bandage.png');
    await Assets.load('glass_shards.png');
    await Assets.load('aimingReticle.png');
    await Assets.load('head.png');
    await Assets.load('torso.png');
    await Assets.load('leftarm.png');
    await Assets.load('rightarm.png');
    await Assets.load('leftleg.png');
    await Assets.load('rightleg.png');

    this.world.CreateWorld();
    // Create map and player

    this.map = this.world.rooms[5][5];

    console.log(this.map.width + ' ' + this.map.height);
    this.map.loadPlayer(1, 1, this.player1);

    // Create PIXI app
    this.app = new Application();
    await this.app.init({
      width: window.innerWidth * 0.7,
      height: window.innerHeight * 0.7,
      backgroundColor: 0x222222,
      antialias: true,
    });
    // Add main game canvas
    container.appendChild(this.app.canvas as HTMLCanvasElement);

    // Create map and player

    this.map.loadPlayer(1, 1, this.player1);
    this.map.loadEnemy(5, 2, this.dummy1);
    this.map.loadEnemy(5, 3, this.heavyDummy1);

    this.map.SpawnItem(1, 3, new Items().gun);
    this.map.SpawnItem(2, 3, new Items().bigGun);

    this.map.tiles[3][3] = this.map.getTileData('glass_shards');

    // Draw grid, player
    this.drawGrid();
    this.drawPlayer();
    this.drawHealthUI();

    // Add containers to stage
    this.app.stage.addChild(this.gridContainer);
    this.app.stage.addChild(this.effectContainer);
    this.app.stage.addChild(this.entityContainer);
    this.app.stage.addChild(this.playerSprite);
    this.app.stage.addChild(this.healthBar);
    this.app.stage.addChild(this.energyBar);
    this.app.stage.addChild(this.reticleContainer);

    // Create inventory and equipped containers side by side
    const inventoryRow = document.createElement('div');
    inventoryRow.style.display = 'flex';
    inventoryRow.style.flexDirection = 'row';
    inventoryRow.style.width = '30vw';
    inventoryRow.style.height = '80vh';
    inventoryRow.style.position = 'absolute';
    inventoryRow.style.right = '0';
    inventoryRow.style.top = '0';
    container.appendChild(inventoryRow);

    const invDiv = document.createElement('div');
    invDiv.id = 'inventory-container';
    invDiv.style.flex = '1';
    invDiv.style.height = '100%';
    inventoryRow.appendChild(invDiv);

    const equippedDiv = document.createElement('div');
    equippedDiv.id = 'equipped-container';
    equippedDiv.style.flex = '1';
    equippedDiv.style.height = '100%';
    inventoryRow.appendChild(equippedDiv);
    this.inventory = new Inventory(invDiv, equippedDiv);

    // Create status row for health and afflictions side by side below main game canvas
    const statusRow = document.createElement('div');
    statusRow.id = 'status-row';
    statusRow.style.display = 'flex';
    statusRow.style.flexDirection = 'row';
    statusRow.style.width = 'window.innerWidth * 0.3';
    statusRow.style.height = 'window.innerHeight * 0.29';
    // Append statusRow after main game canvas
    container.appendChild(statusRow);

    this.healthUIApp = new PIXI.Application();
    await this.healthUIApp.init({
      width: statusRow.clientWidth * 0.1,
      height: window.innerHeight * 0.29,
      backgroundColor: 0x333333,
      antialias: true,
    });
    this.healthUIApp.view.style.display = 'block';

    this.afflictionsApp = new PIXI.Application();
    await this.afflictionsApp.init({
      width: statusRow.clientWidth * 0.2,
      height: window.innerHeight * 0.29,
      backgroundColor: 0x444444,
      antialias: true,
    });
    this.afflictionsApp.view.style.display = 'block';
    this.afflictionsApp.view.style.flexDirection = 'row';

    // Append both canvases to the statusRow for side-by-side display
    statusRow.appendChild(this.healthUIApp.view as HTMLCanvasElement);
    statusRow.appendChild(this.afflictionsApp.view as HTMLCanvasElement);
    this.healthUIApp.stage.addChild(this.healthLimbContainer);

    // Listen for movement
    this.listenForInput(this.player1);
    this.listenForMovement(this.player1);

    // Start game loop
    this.gameLoop();
  }

  async generateRoom(x: number, y: number) {
    this.map = new GameGrid(x, y);
    this.map.createEmptyMap();
    this.map.loadPlayer(1, 1, this.player1);
  }

  generateRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  clampNumber(number: number, min: number, max: number) {
    if (number < min) {
      return min;
    } else if (number > max) {
      return max;
    }
    return number;
  }

  castRay(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stopOnCollision: boolean
  ): [number, number][] {
    const hitTiles: [number, number][] = [];

    // map must exist
    if (!this.map || !this.map.tiles) return hitTiles;

    let x = Math.round(x1);
    let y = Math.round(y1);
    const xEnd = Math.round(x2);
    const yEnd = Math.round(y2);

    const width = this.map.width;
    const height = this.map.height;

    const inBounds = (tx: number, ty: number) =>
      tx >= 0 && ty >= 0 && tx < width && ty < height;

    // Add starting tile if it's inside the map
    if (inBounds(x, y)) {
      hitTiles.push([x, y]);
      if (stopOnCollision && this.map.tiles[x][y].hasCollision) return hitTiles;
    }

    // Degenerate case: start == end
    if (x === xEnd && y === yEnd) return hitTiles;

    let dx = Math.abs(xEnd - x);
    let sx = x < xEnd ? 1 : -1;
    let dy = -Math.abs(yEnd - y);
    let sy = y < yEnd ? 1 : -1;
    let err = dx + dy;

    // Bresenham iteration
    while (!(x === xEnd && y === yEnd)) {
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }

      if (!inBounds(x, y)) break;
      hitTiles.push([x, y]);
      // If requested, stop the ray when we hit a tile that has collision
      if (stopOnCollision && this.map.tiles[x][y].hasCollision) break;
    }

    return hitTiles;
  }

  isLineObstructed(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    ignoreStart: boolean = true,
    ignoreEnd: boolean = false
  ): boolean {
    const tiles = this.castRay(x1, y1, x2, y2, false);
    if (tiles.length === 0) return false;

    const startIndex = ignoreStart ? 1 : 0;
    const endIndex = tiles.length - 1 - (ignoreEnd ? 1 : 0);
    if (endIndex < startIndex) return false;

    for (let i = startIndex; i <= endIndex; i++) {
      const [tx, ty] = tiles[i];
      if (!this.map.isValidTile(tx, ty)) continue;
      const t = this.map.tiles[tx][ty];
      if (t.hasCollision || t.entity) return true;
    }

    return false;
  }

  getTilesInCircle(centerX: number, centerY: number, radius: number) {
    const hitTiles: [number, number][] = [];
    if (radius < 0) return hitTiles;

    // Special-case radius 0: return the center tile if valid
    if (radius === 0) {
      const cx = Math.round(centerX);
      const cy = Math.round(centerY);
      if (this.map.isValidTile(cx, cy)) hitTiles.push([cx, cy]);
      return hitTiles;
    }

    // We want only the edge tiles: include tiles whose center lies close to the
    // circle circumference. Use a quarter-tile tolerance
    const radiusMinus = Math.max(0, radius - 0.25);
    const radiusPlus = radius + 0.25;
    const minDistSq = radiusMinus * radiusMinus;
    const maxDistSq = radiusPlus * radiusPlus;

    const minX = Math.max(0, Math.floor(centerX - radius));
    const maxX = Math.min(this.map.width - 1, Math.ceil(centerX + radius));
    const minY = Math.max(0, Math.floor(centerY - radius));
    const maxY = Math.min(this.map.height - 1, Math.ceil(centerY + radius));

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distSq = dx * dx + dy * dy;
        if (distSq >= minDistSq && distSq <= maxDistSq) {
          if (this.map.isValidTile(x, y)) {
            hitTiles.push([x, y]);
          }
        }
      }
    }

    return hitTiles;
  }

  getTilesInSphere(centerX: number, centerY: number, radius: number) {
    const hitTiles: [number, number][] = [];
    if (radius < 0) return hitTiles;

    const rSq = radius * radius;
    const minX = Math.max(0, Math.floor(centerX - radius));
    const maxX = Math.min(this.map.width - 1, Math.ceil(centerX + radius));
    const minY = Math.max(0, Math.floor(centerY - radius));
    const maxY = Math.min(this.map.height - 1, Math.ceil(centerY + radius));

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        if (dx * dx + dy * dy <= rSq) {
          if (this.map.isValidTile(x, y)) {
            hitTiles.push([x, y]);
          }
        }
      }
    }
    return hitTiles;
  }

  drawHealthBar() {
    this.healthBar.removeChildren();
    this.healthBar.clear();
    const barWidth = 200;
    const barHeight = 20;
    const x = 10;
    const y = 400;

    const myText = new Text({
      text: Math.round(this.player1.health.currentBlood) + ' ml',
      style: {
        fontSize: 20,
        fill: '#ffffff',
      },
      anchor: 0.5,
      y: y + barHeight / 2,
      x: 100,
    });

    // Background
    this.healthBar.drawRect(x, y, barWidth, barHeight);
    this.healthBar.beginFill(0x555555);
    this.healthBar.endFill();

    const bleedingPercentage = Math.min(
      this.player1.health.bleedingRate / this.player1.health.maxBlood,
      1
    );
    const regenPercentage = Math.min(
      this.player1.health.regeneration / this.player1.health.maxBlood,
      1
    );

    // Health
    const healthPercentage =
      this.player1.health.currentBlood / this.player1.health.maxBlood;
    this.healthBar.beginFill(0xff0000);
    this.healthBar.drawRect(x, y, barWidth * healthPercentage, barHeight);
    this.healthBar.addChild(myText);
    this.healthBar.endFill();

    // Bleeding effect
    if (
      this.player1.health.currentBlood > 0 &&
      this.player1.health.bleedingRate > 0 &&
      bleedingPercentage > regenPercentage
    ) {
      this.healthBar.beginFill(0xffff00);
      this.healthBar.drawRect(
        x + barWidth * (healthPercentage - bleedingPercentage),
        y,
        barWidth * bleedingPercentage,
        barHeight
      );
      this.healthBar.endFill();
    }

    // Regeneration effect
    if (
      this.player1.health.regeneration > 0 &&
      this.player1.health.currentBlood < this.player1.health.maxBlood
    ) {
      let regenBarX = x + barWidth * healthPercentage;
      let regenBarWidth = barWidth * regenPercentage;
      if (
        this.player1.health.bleedingRate > 0 &&
        regenPercentage < bleedingPercentage
      ) {
        regenBarX = x + barWidth * (healthPercentage - bleedingPercentage);
      } else if (
        this.player1.health.currentBlood + this.player1.health.regeneration >
        this.player1.health.maxBlood
      ) {
        regenBarWidth =
          barWidth *
          ((this.player1.health.maxBlood - this.player1.health.currentBlood) /
            this.player1.health.maxBlood);
      }
      this.healthBar.beginFill(0x00ff00);
      this.healthBar.drawRect(regenBarX, y, regenBarWidth, barHeight);
      this.healthBar.endFill();
    }
  }

  drawEnergyBar() {
    this.energyBar.removeChildren();
    this.energyBar.clear();
    const barWidth = 200;
    const barHeight = 20;
    const x = 10;
    const y = 430;

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

    this.energyBar.endFill();
  }

  drawGrid() {
    this.gridContainer.removeChildren();
    this.tile.clear();
    this.entityContainer.removeChildren();

    for (let x = 0; x < this.map.width; x++) {
      for (let y = 0; y < this.map.height; y++) {
        // Draw base tile sprite
        if (this.map.tiles[x][y].sprite != '') {
          let texture = Assets.get(this.map.tiles[x][y].sprite.toString());
          let sprite = new PIXI.Sprite(texture);
          sprite.x = x * this.tileSize;
          sprite.y = y * this.tileSize;
          sprite.width = this.tileSize;
          sprite.height = this.tileSize;
          sprite._zIndex = 2;
          this.entityContainer.addChild(sprite);
          if (
            this.map.tiles[x][y].hiddenOutsideLOS == true &&
            this.isLineObstructed(
              this.player1.PosX,
              this.player1.PosY,
              x,
              y,
              true,
              true
            ) == true
          ) {
            sprite.alpha = 0;
          } else if (
            /*else if(this.map.tiles[x][y].hiddenOutsideLOS==false && this.isLineObstructed(this.player1.PosX, this.player1.PosY, x, y,true,true)==true){
            sprite.alpha = 0.5
          }*/
            this.isLineObstructed(
              this.player1.PosX,
              this.player1.PosY,
              x,
              y,
              true,
              true
            ) == false
          ) {
            sprite.alpha = 1;
          }
        }

        const item = this.map.tiles[x][y].item;
        if (item != null) {
          let texture;
          switch (item.name) {
            case 'gun':
              texture = Assets.get('gun.png');
              break;
            case 'bigGun':
              texture = Assets.get('biggun.png');
              break;
            case 'bandage':
              texture = Assets.get('bandage.png');
              break;
            case 'medkit':
              texture = Assets.get('medkit.png');
              break;
            default:
              break;
          }
          let sprite = new PIXI.Sprite(texture);
          sprite.x = x * this.tileSize;
          sprite.y = y * this.tileSize;
          sprite.width = this.tileSize;
          sprite.height = this.tileSize;
          sprite._zIndex = 1;
          this.gridContainer.addChild(sprite);
          if (
            this.isLineObstructed(
              this.player1.PosX,
              this.player1.PosY,
              x,
              y,
              true,
              true
            ) == true
          ) {
            sprite.alpha = 0;
          } else if (
            this.isLineObstructed(
              this.player1.PosX,
              this.player1.PosY,
              x,
              y,
              true,
              true
            ) == false
          ) {
            sprite.alpha = 1;
          }
        }

        // Draw entities (except player)
        const entity = this.map.tiles[x][y].entity;
        if (entity != null) {
          if (!(entity instanceof Player)) {
            let texture;
            switch (true) {
              case entity instanceof Dummy:
                if (!entity.isDead) {
                  texture = Assets.get('dummy.png');
                } else {
                  texture = Assets.get('dummyDead.png');
                }
                break;
              case entity instanceof HeavyDummy:
                if (!entity.isDead) {
                  texture = Assets.get('heavyDummy.png');
                } else {
                  texture = Assets.get('heavyDummyDead.png');
                }
            }
            let sprite = new PIXI.Sprite(texture);
            sprite.x = x * this.tileSize;
            sprite.y = y * this.tileSize;
            sprite.width = this.tileSize;
            sprite.height = this.tileSize;
            sprite._zIndex = 2;
            this.entityContainer.addChild(sprite);
            if (
              this.isLineObstructed(
                this.player1.PosX,
                this.player1.PosY,
                x,
                y,
                true,
                true
              ) == true
            ) {
              sprite.alpha = 0;
            } else if (
              this.isLineObstructed(
                this.player1.PosX,
                this.player1.PosY,
                x,
                y,
                true,
                true
              ) == false
            ) {
              sprite.alpha = 1;
            }
          }
        }

        let firevalue = this.map.tiles[x][y].fireValue;
        if (firevalue > 0) {
          let fireTexture = Assets.get('fire_small.png');
          if (firevalue > 66) {
            fireTexture = Assets.get('fire_large.png');
          } else if (firevalue > 33) {
            fireTexture = Assets.get('fire_medium.png');
          }
          let fireSprite = new PIXI.Sprite(fireTexture);
          fireSprite.x = x * this.tileSize;
          fireSprite.y = y * this.tileSize;
          fireSprite.width = this.tileSize;
          fireSprite.height = this.tileSize;
          fireSprite._zIndex = 5;
          this.gridContainer.addChild(fireSprite);
          if (
            this.map.tiles[x][y].hiddenOutsideLOS == true &&
            this.isLineObstructed(
              this.player1.PosX,
              this.player1.PosY,
              x,
              y,
              true,
              true
            ) == true
          ) {
            fireSprite.alpha = 0;
          } else if (
            this.isLineObstructed(
              this.player1.PosX,
              this.player1.PosY,
              x,
              y,
              true,
              true
            ) == false
          ) {
            fireSprite.alpha = 1;
          }
        }

        this.tile.lineStyle(1, 0x888888);
        this.tile.beginFill(0xcccccc);
        this.tile.drawRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
        this.tile._zIndex = 0;
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

  drawReticle() {
    this.reticleContainer.removeChildren();
    const sprite = Assets.get('aimingReticle.png') as PIXI.Texture;
    const reticleSprite = new PIXI.Sprite(sprite);
    const tileX = this.mouseTileX;
    const tileY = this.mouseTileY;
    const centerX = tileX * this.tileSize + this.tileSize / 2;
    const centerY = tileY * this.tileSize + this.tileSize / 2;
    reticleSprite.alpha = 0;
    if (
      this.aimMode &&
      this.map.tiles[tileX][tileY].hasCollision == false &&
      this.map.tiles[tileX][tileY].name != 'door'
    ) {
      reticleSprite.width = this.tileSize;
      reticleSprite.height = this.tileSize;
      reticleSprite.anchor.set(0.5);
      reticleSprite._zIndex = 50;
      reticleSprite.position.set(centerX, centerY);

      if (
        !this.map ||
        !this.map.isValidTile(tileX, tileY) ||
        this.isLineObstructed(
          this.player1.PosX,
          this.player1.PosY,
          tileX,
          tileY,
          true,
          true
        )
      ) {
        reticleSprite.alpha = 0;
      } else {
        reticleSprite.alpha = 1;
      }
    }
    this.reticleContainer.addChild(reticleSprite);
  }

  drawHealthUI() {
    this.healthLimbContainer.removeChildren();

    const baseX = 80;
    const baseY = 50; // Adjusted for healthUIApp canvas
    const limbSize = 50;

    this.addHealthLimbSprite('head', baseX, baseY, limbSize, limbSize);
    this.addHealthLimbSprite(
      'torso',
      baseX,
      baseY + limbSize,
      limbSize,
      limbSize
    );
    this.addHealthLimbSprite(
      'leftarm',
      baseX - limbSize,
      baseY + limbSize,
      limbSize,
      limbSize
    );
    this.addHealthLimbSprite(
      'rightarm',
      baseX + limbSize,
      baseY + limbSize,
      limbSize,
      limbSize
    );
    this.addHealthLimbSprite(
      'leftleg',
      baseX - limbSize / 2,
      baseY + limbSize * 2,
      limbSize,
      limbSize
    );
    this.addHealthLimbSprite(
      'rightleg',
      baseX + limbSize / 2,
      baseY + limbSize * 2,
      limbSize,
      limbSize
    );
  }

  addHealthLimbSprite(
    limbName: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const texture = Assets.get(`${limbName}.png`);
    const sprite = new PIXI.Sprite(texture);
    sprite.x = x;
    sprite.y = y;
    sprite.width = width;
    sprite.height = height;
    sprite.interactive = true;
    sprite.cursor = 'pointer';
    sprite._zIndex = 1000;
    sprite.on('pointerdown', () => {
      this.selectedLimb = limbName;
      console.log(limbName);
    });
    this.healthLimbContainer.addChild(sprite);
  }

  getAfflictionsForLimb(limbName: string) {
    switch (limbName) {
      case 'head':
        this.afflictions = this.player1.health.head.returnAfflictions();
        break;
      case 'torso':
        this.afflictions = this.player1.health.torso.returnAfflictions();
        break;
      case 'leftarm':
        this.afflictions = this.player1.health.leftArm.returnAfflictions();
        break;
      case 'rightarm':
        this.afflictions = this.player1.health.rightArm.returnAfflictions();
        break;
      case 'leftleg':
        this.afflictions = this.player1.health.leftLeg.returnAfflictions();
        break;
      case 'rightleg':
        this.afflictions = this.player1.health.rightLeg.returnAfflictions();
        break;
    }
  }

  drawAfflictions() {
    this.getAfflictionsForLimb(this.selectedLimb);
    this.afflictionsApp.stage.removeChildren();
    for (let affliction in this.afflictions) {
      if (
        this.afflictions[affliction] > 0 &&
        this.afflictions[affliction] < 100
      ) {
        const afflictionText = new Text({
          text: affliction + ': ' + this.afflictions[affliction],
          style: {
            fontSize: 16,
            fill: '#ffffff',
          },
          y: Object.keys(this.afflictions).indexOf(affliction) * 20 + 10,
          x: 10,
        });
        this.afflictionsApp.stage.addChild(afflictionText);
      }
    }
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
    this.drawReticle();
    this.drawAfflictions();
    requestAnimationFrame(() => this.gameLoop());
  }

  teleportPlayer(player: Player, targetX: number, targetY: number) {
    let playerPosX = player.PosX;
    let playerPosY = player.PosY;
    if (playerPosX < this.map.width && playerPosY < this.map.height) {
      this.map.tiles[playerPosX][playerPosY].entity = null;
    }

    player.PosX = targetX;
    player.PosY = targetY;
    this.map.tiles[targetX][targetY].entity = player;
    this.animatePlayerMove(player, targetX, targetY);
    //player.playerAction(10);
    this.checkUnderPlayer(player);
    console.log('Player teleported to: ' + player.PosX + ', ' + player.PosY);
  }

  tryToMovePlayer(player: Player, targetX: number, targetY: number) {
    if (this.player1.energy.currentEnergy < 10) {
      console.log('Not enough energy');
      return;
    }

    let playerPosX = player.PosX;
    let playerPosY = player.PosY;

    let deltaX = Math.abs(targetX - playerPosX);
    let deltaY = Math.abs(targetY - playerPosY);

    // Bounds and collision check
    const targetTile = this.map.tiles[targetX][targetY];
    // Treat living entities as blocking, but allow movement onto dead Dummies
    const targetEntity = targetTile.entity;
    const entityBlocking =
      targetEntity != null &&
      !(targetEntity instanceof Dummy && targetEntity.isDead);

    if (
      targetX < 0 ||
      targetY < 0 ||
      targetX >= this.map.width ||
      targetY >= this.map.height ||
      targetTile.hasCollision ||
      entityBlocking ||
      deltaX + deltaY > 1
    ) {
      console.log('Collision detected or too far away or out of bounds');
    } else {
      this.map.tiles[playerPosX][playerPosY].entity = null;
      player.PosX = targetX;
      player.PosY = targetY;
      this.map.tiles[targetX][targetY].entity = player;
      this.animatePlayerMove(player, targetX, targetY);
      this.player1.playerAction(0);
      this.checkUnderPlayer(player);
      this.checkTileForItem(player);
    }
  }

  async checkTileForItem(player: Player) {
    if (this.map.tiles[player.PosX][player.PosY].item != null) {
      const item = this.map.tiles[player.PosX][player.PosY].item;
      if (item) {
        const pickedUp = await this.inventory.showPickUpPrompt(item);
        if (pickedUp) {
          this.inventory.pickUp(item);
          this.map.tiles[player.PosX][player.PosY].item = null;
        }
      }
    } else if (this.inventory.pickUpOverlay != null) {
      this.inventory.hidePickUpPrompt();
    }
  }

  findRoom(player: Player) {
    let playerPosX = player.PosX;
    let playerPosY = player.PosY;

    let mapX = this.map.width;
    let mapY = this.map.height;

    if (playerPosX == 0 && playerPosY < mapY) {
      //left
      if (this.playerWorldX - 1 >= 0) {
        this.map.tiles[playerPosX][playerPosY].entity = null;
        this.map = this.world.rooms[this.playerWorldX - 1][this.playerWorldY];
        this.playerWorldX -= 1;
        this.teleportPlayer(
          this.player1,
          this.map.width - 2,
          Math.floor(this.map.height / 2)
        );
        console.log('Moved to left room');
        console.log(
          'World coordinates: ' + this.playerWorldX + ', ' + this.playerWorldY
        );
      }
    } else if (playerPosX == mapX - 1 && playerPosY < mapY) {
      //right
      if (this.playerWorldX + 1 <= 10) {
        this.map.tiles[playerPosX][playerPosY].entity = null;
        this.map = this.world.rooms[this.playerWorldX + 1][this.playerWorldY];
        this.playerWorldX += 1;
        this.teleportPlayer(this.player1, 1, Math.floor(this.map.height / 2));
        console.log('Moved to right room');
        console.log(
          'World coordinates: ' + this.playerWorldX + ', ' + this.playerWorldY
        );
      }
    } else if (playerPosY == 0 && playerPosX < mapX) {
      //up
      if (this.playerWorldY + 1 <= 10) {
        this.map.tiles[playerPosX][playerPosY].entity = null;
        this.map = this.world.rooms[this.playerWorldX][this.playerWorldY + 1];
        this.playerWorldY += 1;
        this.teleportPlayer(
          this.player1,
          Math.floor(this.map.width / 2),
          this.map.height - 2
        );
        console.log('Moved to up room');
        console.log(
          'World coordinates: ' + this.playerWorldX + ', ' + this.playerWorldY
        );
      }
    } else if (playerPosY == mapY - 1 && playerPosX < mapX) {
      //down
      if (this.playerWorldY - 1 >= 0) {
        this.map.tiles[playerPosX][playerPosY].entity = null;
        this.map = this.world.rooms[this.playerWorldX][this.playerWorldY - 1];
        this.playerWorldY -= 1;
        this.teleportPlayer(this.player1, Math.floor(this.map.width / 2), 1);
        console.log('Moved to down room');
        console.log(
          'World coordinates: ' + this.playerWorldX + ', ' + this.playerWorldY
        );
      }
    }
  }

  checkUnderPlayer(player: Player) {
    let tileEffect = this.map.tiles[player.PosX][player.PosY].effect;
    console.log('Tile effect: ' + tileEffect);
    switch (tileEffect) {
      case 'glass_shards':
        player.health.leftLeg.addBleeding(this.clampNumber(2, 0, 100));
        player.health.leftLeg.addLaceration(this.clampNumber(2, 0, 100));
        player.health.rightLeg.addBleeding(this.clampNumber(2, 0, 100));
        player.health.rightLeg.addLaceration(this.clampNumber(2, 0, 100));
        return 'glass_shards';
      case 'fire':
        // player.health.Damage(0, 2.0);
        return 'fire';
      case 'entrance':
        this.findRoom(player);
        return 'entrance';
    }

    return '';
  }

  updateAllTiles() {
    for (let x = 0; x <= this.map.width; x++) {
      for (let y = 0; y <= this.map.height; y++) {
        this.updateTile(x, y);
      }
    }
  }

  updateTile(x: number, y: number) {
    if (this.map.tiles[x][y].fireValue > 0) {
      this.map.damageTile(x, y, this.map.tiles[x][y].fireValue / 5);
      this.map.tiles[x][y].fireValue = this.clampNumber(
        this.map.tiles[x][y].fireValue - this.generateRandomNumber(10, 20),
        0,
        100
      );
      if (this.map.tiles[x][y].name == 'empty') {
        this.map.createTile(x, y, 'ash', true);
      }
      var spreadchance = this.generateRandomNumber(1, 5);
      if (spreadchance == 1) {
        this.ignite(x + 1, y, this.map.tiles[x + 1][y].fireValue + 40, false);
        this.ignite(x - 1, y, this.map.tiles[x - 1][y].fireValue + 40, false);
        this.ignite(x, y + 1, this.map.tiles[x][y + 1].fireValue + 40, false);
        this.ignite(x, y - 1, this.map.tiles[x][y - 1].fireValue + 40, false);
      }
    }
  }

  ignite(x: number, y: number, fireValue: number, additive: boolean) {
    if (this.map.isValidTile(x, y) && this.map.tiles[x][y].flammable == true) {
      if (this.map.tiles[x][y].fireValue <= 0 || additive == false) {
        this.map.tiles[x][y].fireValue += fireValue;
      }
    }
  }

  createExplosion(
    x: number,
    y: number,
    size: number,
    strength: number,
    startFires: boolean = false
  ) {
    (async () => {
      for (let i = 0; i < size; i++) {
        let tiles = this.getTilesInSphere(x, y, i);
        tiles.forEach((tile) => {
          if (
            this.isLineObstructed(x, y, tile[0], tile[1], true, true) == false
          ) {
            let texture = Assets.get('explosion.png');
            let sprite = new PIXI.Sprite(texture);
            sprite.x = tile[0] * this.tileSize;
            sprite.y = tile[1] * this.tileSize;
            sprite.width = this.tileSize;
            sprite.height = this.tileSize;
            sprite._zIndex = 0;
            this.effectContainer.addChild(sprite);
            this.map.damageTile(tile[0], tile[1], strength / size);
            // if (this.player1.PosX == tile[0] && this.player1.PosY == tile[1]) {
            //   this.player1.health.Damage(strength / size / 10);
            // }
            var firechance = this.generateRandomNumber(1, 10);
            if (firechance == 1) {
              this.ignite(tile[0], tile[1], strength, true);
            }
          }
        });
        await this.delay(50);
      }
      this.effectContainer.removeChildren();
    })();
  }

  endTurn() {
    this.updateAllTiles();
    this.checkUnderPlayer(this.player1);
    this.player1.energy.setEnergy(100);
    this.player1.playerAction(0);
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

      this.tryToMovePlayer(player, targetX, targetY);
    });
  }

  listenForInput(player: Player) {
    window.addEventListener('keydown', (event) => {
      switch (event.key.toLowerCase()) {
        case 'x':
          this.endTurn();
          break;
        case 'p':
          this.createExplosion(player.PosX, player.PosY, 4, 50, true);
          this.endTurn();
          break;
        case 'f':
          this.aimMode = !this.aimMode;
          break;
        case 'l':
          this.player1.health.stopBleeding();
          break;
        default:
          return;
      }
    });
    window.addEventListener('mousemove', (event) => {
      if (!this.app || !this.app.view) return;
      const rect = this.app.view.getBoundingClientRect();
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;
      this.mouseX = canvasX;
      this.mouseY = canvasY;
      const coords = this.map.getTileCoords(
        event.clientX,
        event.clientY,
        this.tileSize
      );
      if (coords) {
        this.mouseTileX = coords.x;
        this.mouseTileY = coords.y;
      }
    });

    window.addEventListener('click', (event) => {
      const coords = this.map.getTileCoords(
        event.clientX,
        event.clientY,
        this.tileSize
      );
      if (coords) {
        const targetEntity = this.map.tiles[coords.x][coords.y].entity;
        if (
          this.isLineObstructed(
            this.player1.PosX,
            this.player1.PosY,
            coords.x,
            coords.y,
            true,
            true
          ) == false &&
          (targetEntity instanceof Dummy || targetEntity instanceof HeavyDummy)
        ) {
          if (!targetEntity.isDead && this.aimMode) {
            this.weaponFunctionality.attack(
              coords,
              this.map,
              this.inventory,
              targetEntity
            );
          } else {
            this.inventory.showLootPopup(targetEntity);
          }
        }
      }
    });
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
