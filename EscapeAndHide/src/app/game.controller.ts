import * as PIXI from 'pixi.js';
import { Application, Graphics, Container } from 'pixi.js';
import { Text, Assets } from 'pixi.js';
import { GameGrid } from './grid';
import { World } from './world';
import { Player } from './player';
import { Health } from './health/health';
import { Energy } from './energy/energy';
import { Item } from './items/item';
import { Items, Weapon } from './items/items';
import { WeaponFunctionality } from './items/weapon_functionality';
import { Inventory } from './inventory/inventory';
import { Dummy, HeavyDummy} from './enemyTypes'
import { Wall1,WallCorner1,ExplosiveBarrel,Door} from './entities'

export class GameController {
  static current: GameController | null = null;
  app!: Application;
  map!: GameGrid;
  items = new Items();
  inventory!: Inventory;
  weaponFunctionality = new WeaponFunctionality();
  player1 = new Player();
  dummy1 = new Dummy()
  heavyDummy1 = new HeavyDummy();
  barrel = new ExplosiveBarrel();
  door = new Door();
  world = new World();
  spriteContainer = new Container();
  effectContainer = new Container();
  pickUpPopUp = new Container();
  playerSprite = new Graphics();
  healthBar = new Graphics();
  energyBar = new Graphics();
  tile = new Graphics();
  playerWorldX = 5;
  playerWorldY = 5;
  tileSize = 32; // Size of each tile in pixels
  lastUsedId = 0;

  constructor() {}

  async init(container: HTMLDivElement): Promise<void> {
    // expose the running instance so entities can access controller methods
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
    await Assets.load('explosiveBarrel.png');
    await Assets.load('door_open.png');
    await Assets.load('door_closed.png');

    this.world.CreateWorld();
    // Create map and player

    this.map = this.world.rooms[5][5];

    console.log(this.map.width + ' ' + this.map.height);

    // Create PIXI app
    this.app = new Application();
    await this.app.init({
      width: this.tileSize * 30,
      height: this.tileSize * 30,
      backgroundColor: 0x222222,
      antialias: true,
      resizeTo: window,
    });

    container.appendChild(this.app.canvas as HTMLCanvasElement);

    // Create map and player

    this.loadPlayer(1, 1, this.player1, 1);
    this.loadEntity(5, 2, this.dummy1);
    this.loadEntity(5, 3, this.heavyDummy1);
    this.loadEntity(6, 2, this.barrel);
    this.loadEntity(3, 3, this.door);

    this.spawnItem(1, 3, new Items().gun);
    this.spawnItem(2, 3, new Items().bigGun);

    // Draw grid, player
    this.drawGrid();
    this.drawPlayer();

    // Add containers to stage
    this.app.stage.addChild(this.spriteContainer);
    this.app.stage.addChild(this.effectContainer);
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

    // Pass both containers to Inventory
    this.inventory = new Inventory(invDiv, equippedDiv);

    // Listen for movement
    this.listenForInput(this.player1);
    this.listenForMovement(this.player1);

    // Start game loop
    this.gameLoop();
  }

  async generateRoom(x: number, y: number) {
    this.map = new GameGrid(x, y);
    this.map.createEmptyMap();
    this.loadPlayer(1, 1, this.player1, 1);
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

  castRay(x1: number, y1: number, x2: number, y2: number, stopOnCollision: boolean): [number, number][] {
    const hitTiles: [number, number][] = [];

    // map must exist
    if (!this.map || !this.map.tiles) return hitTiles;

    let x = Math.round(x1);
    let y = Math.round(y1);
    const xEnd = Math.round(x2);
    const yEnd = Math.round(y2);

    const width = this.map.width;
    const height = this.map.height;

    const inBounds = (tx: number, ty: number) => tx >= 0 && ty >= 0 && tx < width && ty < height;

    // Add starting tile if it's inside the map
    if (inBounds(x, y)) {
      hitTiles.push([x, y]);
      if (stopOnCollision && (this.checkForCollision(x,y))) return hitTiles;
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
      if (stopOnCollision && (this.checkForCollision(x,y))) break;
    }

    return hitTiles;
  }

  isLineObstructed(x1: number, y1: number, x2: number, y2: number, ignoreStart: boolean = true, ignoreEnd: boolean = false): boolean {

    const tiles = this.castRay(x1, y1, x2, y2, false);
    if (tiles.length === 0) return false;

    const startIndex = ignoreStart ? 1 : 0;
    const endIndex = tiles.length - 1 - (ignoreEnd ? 1 : 0);
    if (endIndex < startIndex) return false;

    for (let i = startIndex; i <= endIndex; i++) {
      const [tx, ty] = tiles[i];
      if (!this.map.isValidTile(tx, ty)) continue;
      const t = this.map.tiles[tx][ty];
      if (this.checkForCollision(tx,ty)) return true;
    }

    return false;
  }

  isLOSObstructed(x1: number, y1: number, x2: number, y2: number, ignoreStart: boolean = true, ignoreEnd: boolean = false): boolean {

    const tiles = this.castRay(x1, y1, x2, y2, false);
    if (tiles.length === 0) return false;

    const startIndex = ignoreStart ? 1 : 0;
    const endIndex = tiles.length - 1 - (ignoreEnd ? 1 : 0);
    if (endIndex < startIndex) return false;

    for (let i = startIndex; i <= endIndex; i++) {
      const [tx, ty] = tiles[i];
      if (!this.map.isValidTile(tx, ty)) continue;
      if (this.checkForLOSBlocking(tx,ty)) return true;
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
    const myText = new Text({
      text: Math.round(this.player1.Health.currentHealth * 100) / 100 + ' L',
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
      this.player1.Health.Dot / this.player1.Health.maxHealth,
      1
    );
    const regenPercentage = Math.min(
      this.player1.Health.Regeneration / this.player1.Health.maxHealth,
      1
    );

    // Health
    const healthPercentage =
      this.player1.Health.currentHealth / this.player1.Health.maxHealth;
    this.healthBar.beginFill(0xff0000);
    this.healthBar.drawRect(x, y, barWidth * healthPercentage, barHeight);
    this.healthBar.addChild(myText);
    this.healthBar.endFill();

    // DOT effect
    if (this.player1.Health.Dot > 0) {
      let dotRate = this.player1.Health.DotReduceRate / 0.25;
      let dotDamage = 0.25 / this.player1.Health.DotDamageRate;
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
      this.player1.Health.Regeneration > 0 &&
      this.player1.Health.currentHealth < this.player1.Health.maxHealth
    ) {
      if (this.player1.Health.Dot > 0) {
        this.healthBar.beginFill(0x00ff00);
        this.healthBar.drawRect(
          x + barWidth * (healthPercentage - dotPercentage),
          y,
          barWidth * regenPercentage,
          barHeight
        );
        this.healthBar.endFill();
      } else if (
        this.player1.Health.currentHealth + this.player1.Health.Regeneration >
        this.player1.Health.maxHealth
      ) {
        const regenerationToMaxPercentage =
          (this.player1.Health.maxHealth - this.player1.Health.currentHealth) /
          this.player1.Health.maxHealth;
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
    this.player1.Energy.currentEnergy / this.player1.Energy.maxEnergy;
    this.energyBar.beginFill(0xffff00);
    this.energyBar.drawRect(x, y, barWidth * energyPercentage, barHeight);
    this.energyBar.endFill();

    this.energyBar.endFill();
  }

  drawGrid() {
    this.spriteContainer.removeChildren();
    this.tile.clear();

    for (let x = 0; x < this.map.width; x++) {
      for (let y = 0; y < this.map.height; y++) {
        // Draw base tile sprite
        if (this.map.tiles[x][y].sprite != "") {
          let tileTexture = Assets.get(this.map.tiles[x][y].sprite.toString());
          let tileSprite = new PIXI.Sprite(tileTexture);
          tileSprite.x = x * this.tileSize;
          tileSprite.y = y * this.tileSize;
          tileSprite.width = this.tileSize;
          tileSprite.height = this.tileSize;
          tileSprite._zIndex = 2;
          this.spriteContainer.addChild(tileSprite);
        }

        const item = this.map.tiles[x][y].item;
        if(item != null){
          let itemTexture;
          switch(item.name){
            case 'gun':
              itemTexture = Assets.get('gun.png');
              break;
            case 'bigGun':
              itemTexture = Assets.get('biggun.png');
              break;
            case 'bandage':
              itemTexture = Assets.get('bandage.png');
              break;
            case 'medkit':
              itemTexture = Assets.get('medkit.png');
              break;
            default:
              break;
          }
          let itemSprite = new PIXI.Sprite(itemTexture);
          itemSprite.x = x * this.tileSize;
          itemSprite.y = y * this.tileSize;
          itemSprite.width = this.tileSize;
          itemSprite.height = this.tileSize;
          itemSprite._zIndex = 3;
          this.spriteContainer.addChild(itemSprite);
          if (this.isLOSObstructed(this.player1.posX, this.player1.posY, x, y,true,true)==true){
            itemSprite.alpha = 0
          }
          else if(this.isLOSObstructed(this.player1.posX, this.player1.posY, x, y,true,true)==false){
            itemSprite.alpha = 1
          }
        }

        this.getAllEntitiesOnTile(x,y)?.forEach((entity) => {
          if (entity.sprite != "") {
            let entityTexture = Assets.get((entity.sprite).toString())
            let entitySprite = new PIXI.Sprite(entityTexture);
            entitySprite.x = x * this.tileSize;
            entitySprite.y = y * this.tileSize;
            entitySprite.width = this.tileSize;
            entitySprite.height = this.tileSize;
            entitySprite._zIndex = entity.zIndex;
            this.spriteContainer.addChild(entitySprite);
            if (entity.hiddenOutsideLOS){
              if (this.isLOSObstructed(this.player1.posX, this.player1.posY, x, y,true,true)==true){
                entitySprite.alpha = 0
              }
              else if(this.isLOSObstructed(this.player1.posX, this.player1.posY, x, y,true,true)==false){
                entitySprite.alpha = 1
              }
            }
          }
        });

        let firevalue = this.map.tiles[x][y].fireValue;
        if (firevalue > 0) {
          let fireTexture = Assets.get('fire_small.png');
          if (firevalue > 66) {
            fireTexture = Assets.get('fire_large.png');
          } else if (firevalue > 33) {
            fireTexture = Assets.get('fire_medium.png');
          }
          let fireSprite = new PIXI.Sprite(fireTexture);
          fireSprite.x = (x * this.tileSize)
          fireSprite.y = (y * this.tileSize)
          fireSprite.width = this.tileSize
          fireSprite.height = this.tileSize
          fireSprite._zIndex = 10
          this.spriteContainer.addChild(fireSprite);
          if (this.isLOSObstructed(this.player1.posX, this.player1.posY, x, y,true,true)==true){
           fireSprite.alpha = 0
          }
          else if(this.isLOSObstructed(this.player1.posX, this.player1.posY, x, y,true,true)==false){
            fireSprite.alpha = 1
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
        this.tile._zIndex = 1;
        this.tile.endFill();
        this.spriteContainer.addChild(this.tile);
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
    this.playerSprite._zIndex = 8
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

  teleportPlayer(player: Player, targetX: number, targetY: number) {
    let playerPosX = player.posX;
    let playerPosY = player.posY;
    this.map.tiles[targetX][targetY].entity!.push(player)
    player.posX = targetX;
    player.posY = targetY;
    if (playerPosX < this.map.width && playerPosY < this.map.height) {
      this.removePlayer(playerPosX,playerPosY)
    }
    this.animatePlayerMove(player, targetX, targetY);
    this.checkUnderPlayer(player);
    console.log('Player teleported to: ' + player.posX + ', ' + player.posY);
  }

  tryToMovePlayer(player: Player, targetX: number, targetY: number) {
    if (this.player1.Energy.currentEnergy < 10) {
      console.log('Not enough energy');
      return;
    }

    let playerPosX = player.posX;
    let playerPosY = player.posY;

    let deltaX = Math.abs(targetX - playerPosX);
    let deltaY = Math.abs(targetY - playerPosY);

    if (
      targetX < 0 ||
      targetY < 0 ||
      targetX >= this.map.width ||
      targetY >= this.map.height ||
      this.checkForCollision(targetX,targetY) ||
      deltaX + deltaY > 1
    ) {
      console.log('Collision detected or too far away or out of bounds');
    } else {
      this.map.tiles[targetX][targetY].entity!.push(player)
      this.removePlayer(playerPosX,playerPosY)
      player.posX = targetX;
      player.posY = targetY;
      this.animatePlayerMove(player, targetX, targetY);
      this.player1.playerAction(10);
      this.checkUnderPlayer(player);
      this.checkTileForItem(player);
    }
  }

  async checkTileForItem(player: Player) {
    if (this.map.tiles[player.posX][player.posY].item != null) {
      const item = this.map.tiles[player.posX][player.posY].item;
      if (item) {
        const pickedUp = await this.inventory.showPickUpPrompt(item);
        if (pickedUp) {
          this.inventory.pickUp(item);
          this.removeItem(player.posX, player.posY);
        }
      }
    }
  }
  
  findRoom(player: Player) {
    let playerPosX = player.posX;
    let playerPosY = player.posY;

    let mapX = this.map.width;
    let mapY = this.map.height;

    if (playerPosX == 0 && playerPosY < mapY) {
      //left
      if (this.playerWorldX - 1 >= 0) {
        this.removePlayer(playerPosX,playerPosY)
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
        this.removePlayer(playerPosX,playerPosY)
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
        this.removePlayer(playerPosX,playerPosY)
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
        this.removePlayer(playerPosX,playerPosY)
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
    let tileEffect = this.map.tiles[player.posX][player.posY].effect;
   // console.log('Tile effect: ' + tileEffect);
    switch (tileEffect) {
      case 'entrance':
        this.findRoom(player);
        return "entrance"
      default:
        if (tileEffect?.includes("entrance")){
          this.findRoom(player);
          return "entrance"
        }
      }
      return ''
  }

  updateAllTiles() {
    for (let x = 0; x <= this.map.width; x++) {
      for (let y = 0; y <= this.map.height; y++) {
        this.updateTile(x, y);
      }
    }
  }

  updateTile(x: number, y: number){

    if (this.map.tiles[x][y].fireValue > 0){ 
      this.damageEntities(x,y,this.map.tiles[x][y].fireValue/2,"burn")
      this.map.tiles[x][y].fireValue = this.clampNumber(this.map.tiles[x][y].fireValue - this.generateRandomNumber(10,20),0,100)
      if (this.map.tiles[x][y].name=="empty"){
        this.map.createTile(x,y,"ash",true);
      }
      var spreadchance = this.generateRandomNumber(1,5)
      if (spreadchance==1){

        this.ignite(x+1,y,this.map.tiles[x+1][y].fireValue+25,false,false)
        this.ignite(x-1,y,this.map.tiles[x-1][y].fireValue+25,false,false)
        this.ignite(x,y+1,this.map.tiles[x][y+1].fireValue+25,false,false)
        this.ignite(x,y-1,this.map.tiles[x][y-1].fireValue+25,false,false)

      }
    }
  }

  ignite(x: number, y:number, fireValue: number, additive: boolean, ignoreFlammable: boolean){
    if(this.map.isValidTile(x,y) && ignoreFlammable==false && this.map.tiles[x][y].flammable == true || this.map.isValidTile(x,y) && ignoreFlammable==true){
      if (this.map.tiles[x][y].fireValue <= 0 || additive == false){
        this.map.tiles[x][y].fireValue += fireValue;
      }
    }
  }

  createExplosion(x: number, y: number, size: number, strength: number, startFires: boolean = false){

    (async () => { 

      for(let i=0;i<size;i++){
        let tiles = this.getTilesInSphere(x,y,i)
        tiles.forEach((tile) => {
          if (this.isLineObstructed(x,y,tile[0],tile[1],true,true)==false){
            let texture = Assets.get("explosion.png");
            let sprite = new PIXI.Sprite(texture);
            sprite.x = tile[0] * this.tileSize
            sprite.y = tile[1] * this.tileSize
            sprite.width = this.tileSize
            sprite.height = this.tileSize
            sprite._zIndex = 0
            this.effectContainer.addChild(sprite);
            this.damageEntities(tile[0],tile[1],strength/size,"explosion")
            if(this.player1.posX == tile[0] && this.player1.posY == tile[1]){
              this.player1.Health.Damage(strength/size/10)
            }
            var firechance=this.generateRandomNumber(1,5)
            if (firechance==1){
              this.ignite(tile[0],tile[1],strength/4,true,true)
            }
          }
        })
        await this.delay(50);
      }
      this.effectContainer.removeChildren();

    })();

  }

  loadPlayer(x: number, y: number, player: Player, playerId: number) {
    player.posX = x
    player.posY = y
    player.playerId = playerId
  }

  removePlayer(x: number, y: number) {
    let entities = this.getAllEntitiesOnTile(x,y)
    for(let i=0;i<entities.length;i++){
      if (entities[i] instanceof Player){
        entities.splice(i)
      }
    }
  }

  loadEntity(x: number, y: number, entity: any) {
    this.map.tiles[x][y].entity!.push(entity);
    // keep entity coordinates in sync with map placement
    if (entity != null) {
      entity.posX = x;
      entity.posY = y;
      entity.id = this.lastUsedId
      this.lastUsedId += 1
    }
  }

  RemoveEntities(x: number, y: number) {
    this.map.tiles[x][y].entity = [];
  }

  getAllEntitiesOnTile(x: number, y: number) {
    return this.map.tiles[x][y].entity
  }

  checkForCollision(x: number, y: number) {
    let entities = this.getAllEntitiesOnTile(x,y)
    for(let i=0;i<entities.length;i++){
      if (entities[i].collidable){
        return true
      }
    }
    return false
  }

  checkForLOSBlocking(x: number, y: number) {
    let entities = this.getAllEntitiesOnTile(x,y)
    for(let i=0;i<entities.length;i++){
      if (entities[i].blockLOS){
        return true
      }
    }
    return false
  }

  damageEntities(x: number, y: number, damage: number, damageType: string, ignoredId: number|null = null) {
    let entities = this.getAllEntitiesOnTile(x,y)
    for(let i=0;i<entities.length;i++){
      if (ignoredId != null && ignoredId != entities[i].id){
        entities[i].takeDamage(damage,damageType)
      }else if(ignoredId == null){
        entities[i].takeDamage(damage,damageType)
      }
    }
  }

  spawnItem(x: number, y: number, item: Item) {
    this.map.tiles[x][y].item = item;
  }

  removeItem(x: number, y: number, effect?: string) {
    this.map.tiles[x][y].item = null;
  }

  endTurn() {
    this.updateAllTiles();
    this.checkUnderPlayer(this.player1);
    this.player1.Energy.setEnergy(100);
    this.player1.playerAction(0);
  }

  listenForMovement(player: Player) {
    window.addEventListener('keydown', (event) => {
      let targetX = player.posX;
      let targetY = player.posY;

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
          this.createExplosion(player.posX,player.posY,3,100,true)
          this.endTurn()
          break;
        default:
          return;
      }
    });
    window.addEventListener('click', (event) => {
      const coords = this.map.getTileCoords(
        event.clientX,
        event.clientY,
        this.tileSize
      );
      if (coords) {
        this.getAllEntitiesOnTile(coords.x,coords.y)?.forEach((entity) => {
          entity.onUse()
       });
      }
    });
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

}