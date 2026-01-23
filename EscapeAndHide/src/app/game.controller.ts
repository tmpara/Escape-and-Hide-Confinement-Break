import * as PIXI from 'pixi.js';
import { Application, Graphics, Container } from 'pixi.js';
import { Text, Assets } from 'pixi.js';
import { GameGrid } from './grid';
import { World } from './world';
import { Player } from './player';
import { Item} from './items/items';
import { WorldMapRenderer } from './worldMapRenderer';
import { WeaponFunctionality } from './items/weapon_functionality';
import { Inventory } from './inventory/inventory';
import { Entity } from './entity';
import { BasicEnemyAI } from './enemyAI';
import { RoomTransition } from './entities';

export class GameController {
  static current: GameController | null = null;
  app!: Application;
  map!: GameGrid;
  healthUIApp!: PIXI.Application;
  logUIApp!: PIXI.Application;
  afflictionsApp!: PIXI.Application;
  inventory!: Inventory;

  weaponFunctionality = new WeaponFunctionality();
  player1 = new Player();
  world = new World();

  mapContainer?: Container;
  spriteContainer = new Container();
  effectContainer = new Container();
  pickUpPopUp = new Container();

  playerSprite = new Graphics();
  healthBar = new Graphics();
  energyBar = new Graphics();
  tile = new Graphics();
  
  aimMode: boolean = false;
  mouseX: number = 0;
  mouseY: number = 0;
  mouseTileX: number = 0;
  mouseTileY: number = 0;

  healthLimbContainer = new Container();
  limbSprites: Record<string, PIXI.Sprite> = {};
  selectedLimb: string = '';
  afflictions: any = {};

  logs: String[] = [];

  playerWorldX = this.world.startX;
  playerWorldY = this.world.startY;
  tileSize = 32; // Size of each tile in pixels
  lastUsedId = 0;
  mapRenderer?: WorldMapRenderer;
  enemyTurnList: Entity[] = [];

  constructor() {}

  async init(container: HTMLDivElement): Promise<void> {
    GameController.current = this;
    await Assets.load('crosshair_aimmode_invalid.png');
    await Assets.load('crosshair_aimmode.png');
    await Assets.load('crosshair_default.png');
    await Assets.load('crosshair_default_invalid.png');
    await Assets.load('head.png');
    await Assets.load('torso.png');
    await Assets.load('leftarm.png');
    await Assets.load('rightarm.png');
    await Assets.load('leftleg.png');
    await Assets.load('rightleg.png');
    await Assets.load('/sprites/entities/wall_placeholder_base.png');
    await Assets.load('/sprites/entities/wall_placeholder_topcap.png');
    await Assets.load('/sprites/entities/wall_placeholder_bottomcap.png');
    await Assets.load('/sprites/entities/wall_placeholder_leftcap.png');
    await Assets.load('/sprites/entities/wall_placeholder_rightcap.png');
    await Assets.load('/sprites/entities/wall_placeholder_toprightcorner.png');
    await Assets.load('/sprites/entities/wall_placeholder_bottomleftcorner.png');
    await Assets.load('/sprites/entities/wall_placeholder_topleftcorner.png');
    await Assets.load('/sprites/entities/wall_placeholder_bottomrightcorner.png');
    await Assets.load('/sprites/entities/door1.png');
    await Assets.load('/sprites/entities/glass_shards.png');
    await Assets.load('/sprites/entities/explosiveBarrel.png');
    await Assets.load('/sprites/entities/crate.png');
    await Assets.load('/sprites/entities/crate_weapon.png');
    await Assets.load('/sprites/entities/crate_medical.png');
    await Assets.load('/sprites/entities/mine.png');
    await Assets.load('/sprites/entities/door_open_horizontal.png');
    await Assets.load('/sprites/entities/door_closed_horizontal.png');
    await Assets.load('/sprites/entities/door_open_vertical.png');
    await Assets.load('/sprites/entities/door_closed_vertical.png');
    await Assets.load('/sprites/tiles/ash.png');
    await Assets.load('/sprites/npc/dummy.png');
    await Assets.load('/sprites/npc/dummyDead.png');
    await Assets.load('/sprites/npc/heavyDummy.png');
    await Assets.load('/sprites/npc/heavyDummyDead.png');
    await Assets.load('/sprites/items/gun.png');
    await Assets.load('/sprites/items/biggun.png');
    await Assets.load('/sprites/items/medkit.png');
    await Assets.load('/sprites/items/bandage.png');
    await Assets.load('/sprites/effects/explosion.png');
    await Assets.load('/sprites/effects/hidden.png');
    await Assets.load('/sprites/effects/fire_legacy.png');
    await Assets.load('/sprites/effects/fire_large.png');
    await Assets.load('/sprites/effects/fire_medium.png');
    await Assets.load('/sprites/effects/fire_small.png');

    this.world.CreateWorld();
    while (
      this.world.pathFind(
        this.playerWorldX,
        this.playerWorldY,
        this.world.endX,
        this.world.endY
      ) == false
    ) {
      this.world.CreateWorld();
      this.playerWorldX = this.world.startX;
      this.playerWorldY = this.world.startY;
    }
    
    // Create map and player
    this.map = this.world.rooms[this.playerWorldX][this.playerWorldY];
    console.log(this.map.width + ' ' + this.map.height);
    this.loadPlayer(1, 1, this.player1,1);

    // Create PIXI app
    this.app = new Application();
    await this.app.init({
      width: window.innerWidth * 0.7,
      height: window.innerHeight * 0.7,
      backgroundColor: 0x222222,
      antialias: true,
    });

    container.appendChild(this.app.canvas as HTMLCanvasElement);

    // create and place the world map renderer
    this.mapContainer = new Container();
    const mapCellSize = 20; // pixels per world cell in minimap
    // position at top-right with a small margin
    this.mapContainer.x =
    this.app.screen.width - this.world.width * mapCellSize - 16;
    this.mapContainer.y = 8;
    this.app.stage.addChild(this.mapContainer);
    this.mapRenderer = new WorldMapRenderer(
      this.mapContainer,
      this.world,
      mapCellSize,
      2
    );
    this.mapRenderer.draw();

    // make minimap interactive so clicks teleport
    this.mapContainer.interactive = true;
    // ensure the container has a hit area that covers the full minimap
    this.mapContainer.hitArea = new PIXI.Rectangle(
      0,
      0,
      this.world.width * this.mapRenderer.cellSize,
      this.world.height * this.mapRenderer.cellSize
    );
    (this.mapContainer as any).cursor = 'pointer';
    this.mapContainer.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
      // convert global pointer to container-local coordinates
      const localPoint = this.mapContainer!.toLocal(
        new PIXI.Point(e.globalX, e.globalY)
      );
      const cellX = Math.floor(localPoint.x / this.mapRenderer!.cellSize);
      const cellY = Math.floor(localPoint.y / this.mapRenderer!.cellSize);
      if (
        cellX < 0 ||
        cellY < 0 ||
        cellX >= this.world.width ||
        cellY >= this.world.height
      )
        return;
      // require a room id at that position
      const id = this.world.roomsIDs[cellX]
        ? this.world.roomsIDs[cellX][cellY]
        : undefined;
      if (!id) return;
      // teleport the player to the clicked room
      this.teleportToRoom(cellX, cellY);
      console.log(
        'teleported player to room:' + this.world.roomsIDs[cellX][cellY]
      );
    });

    // Create map and player
    this.loadPlayer(1, 1, this.player1, 1);

    // Draw grid, player
    this.drawGrid();
    this.drawPlayer();
    this.drawHealthUI();

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

    this.logUIApp = new PIXI.Application();
    await this.logUIApp.init({
      width: statusRow.clientWidth * 0.4,
      height: window.innerHeight * 0.29,
      backgroundColor: 0x333333,
      antialias: true,
    });
    this.logUIApp.view.style.display = 'block';

    // Append both canvases to the statusRow for side-by-side display
    statusRow.appendChild(this.healthUIApp.view as HTMLCanvasElement);
    statusRow.appendChild(this.afflictionsApp.view as HTMLCanvasElement);
    this.healthUIApp.stage.addChild(this.healthLimbContainer);

    statusRow.appendChild(this.logUIApp.view as HTMLCanvasElement);

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
      if (stopOnCollision && this.checkForCollision(x, y)) return hitTiles;
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
      if (stopOnCollision && this.checkForCollision(x, y)) break;
    }

    return hitTiles;
  }

  isTileWalkable(x: number, y: number): boolean {
    if (!this.map) return false;
    if (!this.map.isValidTile(x, y)) return false;
    const ents = this.map.tiles[x][y].entity;
    if (!ents || ents.length === 0) return true;
    return ents.every(e => !e.collidable);
  }

  /**
   * Return a door-like entity on tile or null.
   * A door entity is expected to have `isDoor` boolean and optional `isOpen` / `open()` members.
   */
  getDoorOnTile(x: number, y: number): any | null {
    if (!this.map || !this.map.isValidTile(x, y)) return null;
    const ents = this.map.tiles[x][y].entity;
    if (!ents) return null;
    for (const e of ents) {
      if (e && (e.name == "Door" )) return e;
    }
    return null;
  }

  /**
   * Allow pathfinding to consider a tile passable if it's walkable OR contains a door.
   * Doors will be handled by the mover (open attempt) when traversed.
   */
  canPathThroughTile(x: number, y: number): boolean {
    if (!this.map || !this.map.isValidTile(x, y)) return false;
    if (this.isTileWalkable(x, y)) return true;
    const door = this.getDoorOnTile(x, y);
    return !!door;
  }

  // A* pathfinder — no diagonal moves, allows stepping on tiles that only contain non-collidable entities.
  findPathAStar(startX: number, startY: number, goalX: number, goalY: number): [number, number][] {
    if (!this.map) return [];
    // bounds checks
    if (!this.map.isValidTile(startX, startY) || !this.map.isValidTile(goalX, goalY)) return [];
    // same tile
    if (startX === goalX && startY === goalY) return [[startX, startY]];

    // goal must be walkable (unless it's the start)
    // allow goal if walkable OR is a door tile (AI will open it)
    if (!this.isTileWalkable(goalX, goalY) && !this.getDoorOnTile(goalX, goalY)) return [];

    const key = (x: number, y: number) => `${x},${y}`;

    const heuristic = (x: number, y: number) => Math.abs(x - goalX) + Math.abs(y - goalY); // Manhattan

    const neighbors = (cx: number, cy: number) => [
      [cx - 1, cy],
      [cx + 1, cy],
      [cx, cy - 1],
      [cx, cy + 1],
    ];

    const openSet: Set<string> = new Set([key(startX, startY)]);
    const gScore: Map<string, number> = new Map([[key(startX, startY), 0]]);
    const fScore: Map<string, number> = new Map([[key(startX, startY), heuristic(startX, startY)]]);
    const cameFrom: Map<string, string> = new Map();

    while (openSet.size > 0) {
      // pick lowest fScore
      let currentKey: string | null = null;
      let currentF = Infinity;
      for (const k of openSet) {
        const f = fScore.get(k) ?? Infinity;
        if (f < currentF) {
          currentF = f;
          currentKey = k;
        }
      }
      if (!currentKey) break;

      const [cx, cy] = currentKey.split(',').map(n => parseInt(n, 10));
      if (cx === goalX && cy === goalY) {
        // reconstruct
        const path: [number, number][] = [];
        let cur: string | undefined = currentKey;
        while (cur) {
          const [px, py] = cur.split(',').map(n => parseInt(n, 10));
          path.push([px, py]);
          cur = cameFrom.get(cur);
        }
        path.reverse();
        return path;
      }

      openSet.delete(currentKey);

      for (const [nx, ny] of neighbors(cx, cy)) {
        if (!this.map.isValidTile(nx, ny)) continue;
        // allow stepping on start even if it contains collidable (player sits there).
        // For other tiles allow if walkable OR contains a door (we plan to open it).
        if (!(nx === startX && ny === startY) && !this.canPathThroughTile(nx, ny)) continue;

        const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;
        const nKey = key(nx, ny);
        if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
          cameFrom.set(nKey, currentKey);
          gScore.set(nKey, tentativeG);
          fScore.set(nKey, tentativeG + heuristic(nx, ny));
          openSet.add(nKey);
        }
      }
    }

    return [];
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
      if (this.checkForCollision(tx, ty)) return true;
    }

    return false;
  }

  isLOSObstructed(
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
      if (this.checkForLOSBlocking(tx, ty)) return true;
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

  getDistance(posX: number, posY: number, targetX: number, targetY: number){
    return Math.max(Math.abs(posX - targetX), Math.abs(posY - targetY))
  }

  drawHealthBar() {
    this.healthBar.removeChildren();
    this.healthBar.clear();
    const barWidth = 200;
    const barHeight = 20;
    const x = 10;
    const y = 570;

    const myText = new Text({
      text: Math.round(this.player1.Health.currentBlood) + ' ml',
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
      this.player1.Health.bloodLoss.severity / this.player1.Health.maxBlood,
      1
    );
    const regenPercentage = Math.min(
      this.player1.Health.regeneration / this.player1.Health.maxBlood,
      1
    );

    // Health
    const healthPercentage =
      this.player1.Health.currentBlood / this.player1.Health.maxBlood;
    this.healthBar.beginFill(0xff0000);
    this.healthBar.drawRect(x, y, barWidth * healthPercentage, barHeight);
    this.healthBar.addChild(myText);
    this.healthBar.endFill();

    // Bleeding effect
    if (
      this.player1.Health.currentBlood > 0 &&
      this.player1.Health.bloodLoss.severity > 0 &&
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
      this.player1.Health.regeneration > 0 &&
      this.player1.Health.currentBlood < this.player1.Health.maxBlood
    ) {
      let regenBarX = x + barWidth * healthPercentage;
      let regenBarWidth = barWidth * regenPercentage;
      if (
        this.player1.Health.bloodLoss.severity > 0 &&
        regenPercentage < bleedingPercentage
      ) {
        regenBarX = x + barWidth * (healthPercentage - bleedingPercentage);
      } else if (
        this.player1.Health.currentBlood + this.player1.Health.regeneration >
        this.player1.Health.maxBlood
      ) {
        regenBarWidth =
          barWidth *
          ((this.player1.Health.maxBlood - this.player1.Health.currentBlood) /
            this.player1.Health.maxBlood);
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
    const y = 600;

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
        if (this.map.tiles[x][y].sprite != '') {
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
        if (item != null) {
          let itemTexture;
          switch (item.name) {
            case 'gun':
              itemTexture = Assets.get('/sprites/items/gun.png');
              break;
            case 'bigGun':
              itemTexture = Assets.get('/sprites/items/biggun.png');
              break;
            case 'bandage':
              itemTexture = Assets.get('/sprites/items/bandage.png');
              break;
            case 'medkit':
              itemTexture = Assets.get('/sprites/items/medkit.png');
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
          if (
            this.isLOSObstructed(
              this.player1.posX,
              this.player1.posY,
              x,
              y,
              true,
              true
            ) == true
          ) {
            itemSprite.alpha = 0;
          } else if (
            this.isLOSObstructed(
              this.player1.posX,
              this.player1.posY,
              x,
              y,
              true,
              true
            ) == false
          ) {
            itemSprite.alpha = 1;
          }
        }

        this.getAllEntitiesOnTile(x, y)?.forEach((entity: any) => {
          if (entity.sprite != '') {
            let entityTexture = Assets.get(entity.sprite.toString());
            let entitySprite = new PIXI.Sprite(entityTexture);
            if (
              entity.isDead &&
              entity.tags.includes('dummy') &&
              entity.deadSprite
            ) {
              entity.texture = Assets.get(entity.deadSprite.toString());
              entitySprite.texture = entity.texture;
            }
            entitySprite.x = x * this.tileSize;
            entitySprite.y = y * this.tileSize;
            entitySprite.width = this.tileSize;
            entitySprite.height = this.tileSize;
            entitySprite._zIndex = entity.zIndex;
            this.spriteContainer.addChild(entitySprite);
            // handle wall connections
            const shouldSpawnCap = (x: number, y: number) => {
              if (this.map.isValidTile(x, y)) {
                let entities = this.getAllEntitiesOnTile(x, y);
                for (let i = 0; i < entities.length; i++) {
                  if (entities[i].connectsWith == entity.connectsWith) {
                    return false;
                  }
                }
              }
              return true;
            };
            if (shouldSpawnCap(x, y - 1) && entity.spriteTopCap != '') {
              let capTexture = Assets.get(entity.spriteTopCap.toString());
              let capSprite = new PIXI.Sprite(capTexture);
              capSprite.x = x * this.tileSize;
              capSprite.y = y * this.tileSize;
              capSprite.width = this.tileSize;
              capSprite.height = this.tileSize;
              capSprite._zIndex = entity.zIndex + 0.1;
              this.spriteContainer.addChild(capSprite);
            }
            if (shouldSpawnCap(x, y + 1) && entity.spriteBottomCap != '') {
              let capTexture = Assets.get(entity.spriteBottomCap.toString());
              let capSprite = new PIXI.Sprite(capTexture);
              capSprite.x = x * this.tileSize;
              capSprite.y = y * this.tileSize;
              capSprite.width = this.tileSize;
              capSprite.height = this.tileSize;
              capSprite._zIndex = entity.zIndex + 0.1;
              this.spriteContainer.addChild(capSprite);
            }
            if (shouldSpawnCap(x - 1, y) && entity.spriteLeftCap != '') {
              let capTexture = Assets.get(entity.spriteLeftCap.toString());
              let capSprite = new PIXI.Sprite(capTexture);
              capSprite.x = x * this.tileSize;
              capSprite.y = y * this.tileSize;
              capSprite.width = this.tileSize;
              capSprite.height = this.tileSize;
              capSprite._zIndex = entity.zIndex + 0.1;
              this.spriteContainer.addChild(capSprite);
            }
            if (shouldSpawnCap(x + 1, y) && entity.spriteRightCap != '') {
              let capTexture = Assets.get(entity.spriteRightCap.toString());
              let capSprite = new PIXI.Sprite(capTexture);
              capSprite.x = x * this.tileSize;
              capSprite.y = y * this.tileSize;
              capSprite.width = this.tileSize;
              capSprite.height = this.tileSize;
              capSprite._zIndex = entity.zIndex + 0.1;
              this.spriteContainer.addChild(capSprite);
            }
            //corners
            //top left
            if (
              shouldSpawnCap(x - 1, y) == false &&
              shouldSpawnCap(x, y - 1) == false &&
              shouldSpawnCap(x - 1, y - 1) &&
              entity.spriteTopLeftCorner != ''
            ) {
              let capTexture = Assets.get(
                entity.spriteTopLeftCorner.toString()
              );
              let capSprite = new PIXI.Sprite(capTexture);
              capSprite.x = x * this.tileSize;
              capSprite.y = y * this.tileSize;
              capSprite.width = this.tileSize;
              capSprite.height = this.tileSize;
              capSprite._zIndex = entity.zIndex + 0.2;
              this.spriteContainer.addChild(capSprite);
            }
            //top right
            if (
              shouldSpawnCap(x + 1, y) == false &&
              shouldSpawnCap(x, y - 1) == false &&
              shouldSpawnCap(x + 1, y - 1) &&
              entity.spriteTopRightCorner != ''
            ) {
              let capTexture = Assets.get(
                entity.spriteTopRightCorner.toString()
              );
              let capSprite = new PIXI.Sprite(capTexture);
              capSprite.x = x * this.tileSize;
              capSprite.y = y * this.tileSize;
              capSprite.width = this.tileSize;
              capSprite.height = this.tileSize;
              capSprite._zIndex = entity.zIndex + 0.2;
              this.spriteContainer.addChild(capSprite);
            }
            //bottom left
            if (
              shouldSpawnCap(x - 1, y) == false &&
              shouldSpawnCap(x, y + 1) == false &&
              shouldSpawnCap(x - 1, y + 1) &&
              entity.spriteBottomLeftCorner != ''
            ) {
              let capTexture = Assets.get(
                entity.spriteBottomLeftCorner.toString()
              );
              let capSprite = new PIXI.Sprite(capTexture);
              capSprite.x = x * this.tileSize;
              capSprite.y = y * this.tileSize;
              capSprite.width = this.tileSize;
              capSprite.height = this.tileSize;
              capSprite._zIndex = entity.zIndex + 0.2;
              this.spriteContainer.addChild(capSprite);
            }
            //bottom right
            if (
              shouldSpawnCap(x + 1, y) == false &&
              shouldSpawnCap(x, y + 1) == false &&
              shouldSpawnCap(x + 1, y + 1) &&
              entity.spriteBottomRightCorner != ''
            ) {
              let capTexture = Assets.get(
                entity.spriteBottomRightCorner.toString()
              );
              let capSprite = new PIXI.Sprite(capTexture);
              capSprite.x = x * this.tileSize;
              capSprite.y = y * this.tileSize;
              capSprite.width = this.tileSize;
              capSprite.height = this.tileSize;
              capSprite._zIndex = entity.zIndex + 0.2;
              this.spriteContainer.addChild(capSprite);
            }
            if (entity.hiddenOutsideLOS) {
              if (
                this.isLOSObstructed(
                  this.player1.posX,
                  this.player1.posY,
                  x,
                  y,
                  true,
                  true
                ) == true
              ) {
                entitySprite.alpha = 0;
              } else if (
                this.isLOSObstructed(
                  this.player1.posX,
                  this.player1.posY,
                  x,
                  y,
                  true,
                  true
                ) == false
              ) {
                entitySprite.alpha = 1;
              }
            }
          }
        });

        let firevalue = this.map.tiles[x][y].fireValue;
        if (firevalue > 0) {
          let fireTexture = Assets.get('/sprites/effects/fire_small.png');
          if (firevalue > 66) {
            fireTexture = Assets.get('/sprites/effects/fire_large.png');
          } else if (firevalue > 33) {
            fireTexture = Assets.get('/sprites/effects/fire_medium.png');
          }
          let fireSprite = new PIXI.Sprite(fireTexture);
          fireSprite.x = x * this.tileSize;
          fireSprite.y = y * this.tileSize;
          fireSprite.width = this.tileSize;
          fireSprite.height = this.tileSize;
          fireSprite._zIndex = 10;
          this.spriteContainer.addChild(fireSprite);
          if (
            this.isLOSObstructed(
              this.player1.posX,
              this.player1.posY,
              x,
              y,
              true,
              true
            ) == true
          ) {
            fireSprite.alpha = 0;
          } else if (
            this.isLOSObstructed(
              this.player1.posX,
              this.player1.posY,
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
    this.playerSprite._zIndex = 8;
  }

  drawReticle() {
    let sprite = Assets.get('crosshair_default.png') as PIXI.Texture;
    const tileX = this.mouseTileX;
    const tileY = this.mouseTileY;
    const centerX = tileX * this.tileSize + this.tileSize / 2;
    const centerY = tileY * this.tileSize + this.tileSize / 2;
    if (this.map.isValidTile(tileX, tileY)){
      if (!this.aimMode){
        if(this.getDistance(this.player1.posX,this.player1.posY,tileX,tileY)<=1 && !this.isLineObstructed(this.player1.posX,this.player1.posY,tileX,tileY,true,true)){
          sprite = Assets.get('crosshair_default.png') as PIXI.Texture;
        }else{
          sprite = Assets.get('crosshair_default_invalid.png') as PIXI.Texture;
        }
      }else{
        if (!this.isLineObstructed(this.player1.posX,this.player1.posY,tileX,tileY,true,true)){
          sprite = Assets.get('crosshair_aimmode.png') as PIXI.Texture;
        }else{
          sprite = Assets.get('crosshair_aimmode_invalid.png') as PIXI.Texture;
        }}
        let reticleSprite = new PIXI.Sprite(sprite);
        reticleSprite.alpha = 1;
        reticleSprite.width = this.tileSize;
        reticleSprite.height = this.tileSize;
        reticleSprite.anchor.set(0.5);
        reticleSprite._zIndex = 50;
        reticleSprite.position.set(centerX, centerY);
        this.spriteContainer.addChild(reticleSprite);
    }
  }

  drawHealthUI() {
    this.healthLimbContainer.removeChildren();

    const baseX = 80;
    const baseY = 50; // Adjusted for healthUIApp canvas
    const limbSize = 50;

    this.addHealthLimbSprite(
      'head',
      baseX,
      baseY,
      limbSize,
      limbSize,
      this.selectedLimb === 'head'
    );
    this.addHealthLimbSprite(
      'torso',
      baseX,
      baseY + limbSize,
      limbSize,
      limbSize,
      this.selectedLimb === 'torso'
    );
    this.addHealthLimbSprite(
      'leftarm',
      baseX - limbSize,
      baseY + limbSize,
      limbSize,
      limbSize,
      this.selectedLimb === 'leftarm'
    );
    this.addHealthLimbSprite(
      'rightarm',
      baseX + limbSize,
      baseY + limbSize,
      limbSize,
      limbSize,
      this.selectedLimb === 'rightarm'
    );
    this.addHealthLimbSprite(
      'leftleg',
      baseX - limbSize / 2,
      baseY + limbSize * 2,
      limbSize,
      limbSize,
      this.selectedLimb === 'leftleg'
    );
    this.addHealthLimbSprite(
      'rightleg',
      baseX + limbSize / 2,
      baseY + limbSize * 2,
      limbSize,
      limbSize,
      this.selectedLimb === 'rightleg'
    );
  }

  addHealthLimbSprite(
    limbName: string,
    x: number,
    y: number,
    width: number,
    height: number,
    selected: boolean = false
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
    sprite.alpha = selected ? 0.5 : 1;
    sprite.on('pointerdown', () => {
      this.selectedLimb = limbName;
      this.drawHealthUI();
      console.log(limbName);
    });
    this.healthLimbContainer.addChild(sprite);
  }

  getAfflictionsForLimb(limbName: string) {
    switch (limbName) {
      case 'head':
        this.afflictions = this.player1.Health.head.returnAfflictions();
        break;
      case 'torso':
        this.afflictions = this.player1.Health.torso.returnAfflictions();
        break;
      case 'leftarm':
        this.afflictions = this.player1.Health.leftArm.returnAfflictions();
        break;
      case 'rightarm':
        this.afflictions = this.player1.Health.rightArm.returnAfflictions();
        break;
      case 'leftleg':
        this.afflictions = this.player1.Health.leftLeg.returnAfflictions();
        break;
      case 'rightleg':
        this.afflictions = this.player1.Health.rightLeg.returnAfflictions();
        break;
    }
  }

  drawAfflictions() {
    this.getAfflictionsForLimb(this.selectedLimb);
    this.afflictionsApp.stage.removeChildren();
    let i = 0;
     const afflictionText = new Text({
          text: this.selectedLimb,
          style: {
            fontSize: 16,
            fill: '#ffffff',
          },
          y: i * 24 + 10,
          x: 10,
        });
        i++
    this.afflictionsApp.stage.addChild(afflictionText);
    for (let affliction in this.afflictions) {
      const afflictionValue = this.afflictions[affliction];
      if (afflictionValue.severity > 0) {
        const afflictionText = new Text({
          text: afflictionValue.name + ': ' + afflictionValue.severity,
          style: {
            fontSize: 16,
            fill: '#ffffff',
          },
          y: i * 24 + 10,
          x: 10,
        });
        this.afflictionsApp.stage.addChild(afflictionText);
        i++;
      }
    }
  }

  drawLogsUI(){
    this.logUIApp.stage.removeChildren();
    let i = 0;
    for (i=0; i<this.logs.length; i++){
      const logText = new Text({
        text: this.logs[i],
        style: {
          fontSize: 20,
          fill: '#ffffff',
        },
        y: i * 25 + 10,
        x: 10,
      });
      this.logUIApp.stage.addChild(logText);
    }
  }

  addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`${timestamp}` + ' - ' + message);
    if (this.logs.length > 10) {
      this.logs.shift();
    }
    this.drawLogsUI();
    console.log(`${timestamp}` + ' - ' + message);
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
    // update minimap if present (set player pos first)
    if (this.mapRenderer) {
      this.mapRenderer.setPlayer(this.playerWorldX, this.playerWorldY);
      this.mapRenderer.update();
    }
    this.drawGrid();
    this.drawPlayer();
    this.drawHealthBar();
    this.drawEnergyBar();
    this.drawReticle();
    this.drawAfflictions();
    requestAnimationFrame(() => this.gameLoop());
  }

  teleportPlayer(player: Player, targetX: number, targetY: number) {
    let playerPosX = player.posX;
    let playerPosY = player.posY;
    this.map.tiles[targetX][targetY].entity!.push(player);
    player.posX = targetX;
    player.posY = targetY;
    player.renderX = targetX;
    player.renderY = targetY;
    if (playerPosX < this.map.width && playerPosY < this.map.height) {
      this.removePlayer(playerPosX, playerPosY);
    }
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
      this.checkForCollision(targetX, targetY) ||
      deltaX + deltaY > 1
    ) {
      console.log('Collision detected or too far away or out of bounds');
    } else {
      this.map.tiles[targetX][targetY].entity!.push(player);
      this.removePlayer(playerPosX, playerPosY);
      player.posX = targetX;
      player.posY = targetY;
      this.animatePlayerMove(player, targetX, targetY);
      this.player1.playerAction(0);
      let entities = this.getAllEntitiesOnTile(targetX, targetY);
      for (let i = 0; i < entities.length; i++) {
        entities[i].onSteppedOn(player);
      }
      // this.checkTileForItem(player);
    }
  }

  // async checkTileForItem(player: Player) {
  //   if (this.map.tiles[player.posX][player.posY].item != null) {
  //     const item = this.map.tiles[player.posX][player.posY].item;
  //     if (item) {
  //       const pickedUp = await this.inventory.showPickUpPrompt(item);
  //       if (pickedUp) {
  //         this.inventory.pickUp(item);
  //         this.removeItem(player.posX, player.posY);
  //       }
  //     }
  //   } else if (this.inventory.pickUpOverlay != null) {
  //     this.inventory.hidePickUpPrompt();
  //   }
  // }

  findRoom(player: Player, transition: RoomTransition) {
    let playerPosX = player.posX;
    let playerPosY = player.posY;

    let mapX = this.map.width;
    let mapY = this.map.height;

    if (transition.type == 'left') {
      //left
      if (this.playerWorldX - 1 >= 0) {
        this.removePlayer(playerPosX, playerPosY);
        this.map = this.world.rooms[this.playerWorldX - 1][this.playerWorldY];
        this.playerWorldX -= 1;
        let x = this.findEntrance('right')!.x;
        let y = this.findEntrance('right')!.y;
        this.teleportPlayer(this.player1, x, y);
        console.log('Moved to left room');
        console.log(
          'World coordinates: ' + this.playerWorldX + ', ' + this.playerWorldY
        );
      }
    } else if (transition.type == 'right') {
      //right
      if (this.playerWorldX + 1 <= 10) {
        this.removePlayer(playerPosX, playerPosY);
        this.map = this.world.rooms[this.playerWorldX + 1][this.playerWorldY];
        this.playerWorldX += 1;
        let x = this.findEntrance('left')!.x;
        let y = this.findEntrance('left')!.y;
        this.teleportPlayer(this.player1, x, y);
        console.log('Moved to right room');
        console.log(
          'World coordinates: ' + this.playerWorldX + ', ' + this.playerWorldY
        );
      }
    } else if (transition.type == 'up') {
      //up
      if (this.playerWorldY - 1 >= 0) {
        this.removePlayer(playerPosX, playerPosY);
        this.map = this.world.rooms[this.playerWorldX][this.playerWorldY - 1];
        this.playerWorldY -= 1;
        let x = this.findEntrance('down')!.x;
        let y = this.findEntrance('down')!.y;
        this.teleportPlayer(this.player1, x, y);
        console.log('Moved to up room');
        console.log(
          'World coordinates: ' + this.playerWorldX + ', ' + this.playerWorldY
        );
      }
    } else if (transition.type == 'down') {
      //down
      if (this.playerWorldY + 1 <= 10) {
        this.removePlayer(playerPosX, playerPosY);
        this.map = this.world.rooms[this.playerWorldX][this.playerWorldY + 1];
        this.playerWorldY += 1;
        let x = this.findEntrance('up')!.x;
        let y = this.findEntrance('up')!.y;
        this.teleportPlayer(this.player1, x, y);
        console.log('Moved to down room');
        console.log(
          'World coordinates: ' + this.playerWorldX + ', ' + this.playerWorldY
        );
      }
    }
  }

  findEntrance(side: string) {
    let entities = [];
    for (let x = 0; x <= this.map.width; x++) {
      for (let y = 0; y <= this.map.height; y++) {
        switch (side) {
          case 'left':
            entities = GameController.current?.getAllEntitiesOnTile(x, y)!;
            for (let i = 0; i < entities.length!; i++) {
              if (
                entities[i] instanceof RoomTransition &&
                (entities[i] as RoomTransition).type == 'left'
              ) {
                return { x: x + 1, y: y };
              }
            }
            break;
          case 'right':
            entities = GameController.current?.getAllEntitiesOnTile(x, y)!;
            for (let i = 0; i < entities.length!; i++) {
              if (
                entities[i] instanceof RoomTransition &&
                (entities[i] as RoomTransition).type == 'right'
              ) {
                return { x: x - 1, y: y };
              }
            }
            break;
          case 'up':
            entities = GameController.current?.getAllEntitiesOnTile(x, y)!;
            for (let i = 0; i < entities.length!; i++) {
              if (
                entities[i] instanceof RoomTransition &&
                (entities[i] as RoomTransition).type == 'up'
              ) {
                return { x: x, y: y + 1 };
              }
            }
            break;
          case 'down':
            entities = GameController.current?.getAllEntitiesOnTile(x, y)!;
            for (let i = 0; i < entities.length!; i++) {
              if (
                entities[i] instanceof RoomTransition &&
                (entities[i] as RoomTransition).type == 'down'
              ) {
                return { x: x, y: y - 1 };
              }
            }
            break;
          default:
            return { x: 0, y: 0 };
        }
      }
    }
    return;
  }

   updateAllTiles() {
    this.enemyTurnList = [];
    for (let x = 0; x < this.map.width; x++) {
      for (let y = 0; y < this.map.height; y++) {
        this.updateTile(x, y);
      }
    }
   
    for (const entity of this.enemyTurnList) {
      try {
        // Let the entity take its turn (may be synchronous)
        entity.onEndTurn();
      } catch (err) {
        console.warn('Error during entity turn', err);
      }

      // redraw so player sees the result immediately
      this.drawGrid();
      this.drawPlayer();
    }
    
  }

  updateTile(x: number, y: number) {
    if (this.map.tiles[x][y].fireValue > 0) {
      this.damageEntities(x, y, this.map.tiles[x][y].fireValue / 2, 'burn');
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
        this.ignite(
          x + 1,
          y,
          this.map.tiles[x + 1][y].fireValue + 25,
          false,
          false
        );
        this.ignite(
          x - 1,
          y,
          this.map.tiles[x - 1][y].fireValue + 25,
          false,
          false
        );
        this.ignite(
          x,
          y + 1,
          this.map.tiles[x][y + 1].fireValue + 25,
          false,
          false
        );
        this.ignite(
          x,
          y - 1,
          this.map.tiles[x][y - 1].fireValue + 25,
          false,
          false
        );
      }
    }
      this.map.tiles[x][y].entity!.forEach((entity) => {
        entity.onEndTurn()
        if (entity.ai){
          this.enemyTurnList.push(entity);
        }
        
    });
  }

  aiTargetUpdate(){
     for (let x = 0; x < this.map.width; x++) {
      for (let y = 0; y < this.map.height; y++) {
        this.updateTarget(x, y);
      }
    }
  }

  updateTarget(x: number, y: number){
  this.map.tiles[x][y].entity!.forEach((entity) => {
        if (entity.ai){
          if (entity instanceof BasicEnemyAI){
            entity.findTargets();
            console.log(entity.LastKnownTargetCoords)
            console.log("ai find targerts")
          }else{
            console.log("no ai find targerts")
          }
        }

    });
  }

  ignite(
    x: number,
    y: number,
    fireValue: number,
    additive: boolean,
    ignoreFlammable: boolean
  ) {
    if (
      (this.map.isValidTile(x, y) &&
        ignoreFlammable == false &&
        this.map.tiles[x][y].flammable == true) ||
      (this.map.isValidTile(x, y) && ignoreFlammable == true)
    ) {
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
    startFires: boolean = false,
    cause: string = ""
  ) {
    (async () => {
      for (let i = 0; i < size; i++) {
        let tiles = this.getTilesInSphere(x, y, i);
        tiles.forEach((tile) => {
          if (
            this.isLineObstructed(x, y, tile[0], tile[1], true, true) == false
          ) {
            let texture = Assets.get('/sprites/effects/explosion.png');
            let sprite = new PIXI.Sprite(texture);
            sprite.x = tile[0] * this.tileSize;
            sprite.y = tile[1] * this.tileSize;
            sprite.width = this.tileSize;
            sprite.height = this.tileSize;
            sprite._zIndex = 0;
            this.effectContainer.addChild(sprite);
            this.damageEntities(tile[0], tile[1], strength / size, 'explosion');
            if (this.player1.posX == tile[0] && this.player1.posY == tile[1]) {
              // this.player1.Health.Damage(strength / size / 10);
            }
            var firechance = this.generateRandomNumber(1, 5);
            if (firechance == 1 && startFires) {
              this.ignite(tile[0], tile[1], strength / 4, true, true);
            }
          }
        });
        await this.delay(50);
      }
      this.effectContainer.removeChildren();
    })();
    // Log exlosions
    if(cause!=""){
      this.addLog(cause + " caused an explosion!");
    }else{
      this.addLog("Something exploded!");
    }
  }

  loadPlayer(x: number, y: number, player: Player, playerId: number) {
    player.posX = x
    player.posY = y
    player.renderX = x
    player.renderY = y
    this.map.tiles[x][y].entity!.push(player)
    player.playerId = playerId
  }

  removePlayer(x: number, y: number) {
    let entities = this.getAllEntitiesOnTile(x, y);
    for (let i = 0; i < entities.length; i++) {
      if (entities[i] instanceof Player) {
        entities.splice(i);
      }
    }
  }

  loadEntity(x: number, y: number, entity: any, map: GameGrid) {
    // keep entity coordinates in sync with map placement
    if (entity != null) {
      map.tiles[x][y].entity!.push(entity);
      entity.posX = x;
      entity.posY = y;
      entity.id = this.lastUsedId;
      this.lastUsedId += 1;
    }
  }

  removeEntities(x: number, y: number) {
    this.map.tiles[x][y].entity = [];
  }

  getAllEntitiesOnTile(x: number, y: number) {
    return this.map.tiles[x][y].entity;
  }

  checkForCollision(x: number, y: number) {
    let entities = this.getAllEntitiesOnTile(x, y);
    for (let i = 0; i < entities.length; i++) {
      if (entities[i].collidable) {
        return true;
      }
    }
    return false;
  }

  checkForLOSBlocking(x: number, y: number) {
    let entities = this.getAllEntitiesOnTile(x, y);
    for (let i = 0; i < entities.length; i++) {
      if (entities[i].blockLOS) {
        return true;
      }
    }
    return false;
  }

  damageEntities(
    x: number,
    y: number,
    damage: number,
    damageType: string,
    ignoredId: number | null = null
  ) {
    let entities = this.getAllEntitiesOnTile(x, y);
    for (let i = 0; i < entities.length; i++) {
      if (ignoredId != null && ignoredId != entities[i].id) {
        entities[i].takeDamage(damage, damageType);
      } else if (ignoredId == null) {
        entities[i].takeDamage(damage, damageType);
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
    this.player1.Energy.setEnergy(100);
    if (this.player1.Health.torso.zapped.severity > 0) {
      this.player1.Energy.loseEnergy(this.player1.Health.torso.zapped.severity)
      if (this.player1.Health.torso.zapped.severity >= 5){
      this.player1.Health.torso.zapped.severity = this.player1.Health.torso.zapped.severity - 5;
    } else {
      this.player1.Health.torso.zapped.severity = 0;
    }
    }
    this.player1.playerAction(0);
  }

  listenForMovement(player: Player) {
    window.addEventListener('keydown', (event) => {
      let targetX = player.posX;
      let targetY = player.posY;

      switch (event.key.toLowerCase()) {
        case 'w':
          targetY -= 1;
          this.aiTargetUpdate()
          break;
        case 'a':
          targetX -= 1;
          this.aiTargetUpdate()
          break;
        case 's':
          targetY += 1;
          this.aiTargetUpdate()
          break;
        case 'd':
          targetX += 1;
          this.aiTargetUpdate()
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
          this.addLog("Player ended their turn.");
          this.endTurn();
          break;
        case 'p':
          this.createExplosion(player.posX, player.posY, 3, 100, true);
          this.endTurn();
          break;
        case 'f':
          this.aimMode = !this.aimMode;
          break;
        case 'l':
          this.player1.Health.stopBleeding();
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
        const tileInfo = this.map.tiles[coords.x][coords.y].getTileInfo();
        console.log(coords, tileInfo);

        this.onTileClick(coords.x, coords.y, tileInfo);

        if (!this.aimMode) {
          if (this.getDistance(this.player1.posX, this.player1.posY, coords.x, coords.y)<=1 && !this.isLineObstructed(this.player1.posX,this.player1.posY,coords.x, coords.y,true,true)){
            this.getAllEntitiesOnTile(coords.x, coords.y)?.forEach(
              (entity: any) => {
                entity.onUse(player);
              }
            );
            const entity = this.map.tiles[coords.x][coords.y].entity;
            this.inventory.showLootPopup(entity[0]);
          }
        }else{
          const entity = this.map.tiles[coords.x][coords.y].entity;
          if (entity && entity.length > 0) {
            this.weaponFunctionality.attack(
              coords,
              this.map,
              this.inventory,
              entity[0]
            );
          }
        }
      }
    });
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  teleportToRoom(worldX: number, worldY: number) {
    // ensure target room exists
    if (!this.world.rooms[worldX] || !this.world.rooms[worldX][worldY]) return;

    // clear player from current room (if within bounds)
    if (
      this.map &&
      this.player1.posX >= 0 &&
      this.player1.posY >= 0 &&
      this.player1.posX < this.map.width &&
      this.player1.posY < this.map.height
    ) {
      this.removePlayer(this.player1.posX, this.player1.posY);
    }

    // switch to target room
    this.map = this.world.rooms[worldX][worldY];
    this.playerWorldX = worldX;
    this.playerWorldY = worldY;

    // choose a safe destination (center)
    const targetX = Math.floor(this.map.width / 2);
    const targetY = Math.floor(this.map.height / 2);

    // set player position in new room and mark entity
    this.player1.posX = targetX;
    this.player1.posY = targetY;
    this.map.tiles[targetX][targetY].entity.push(this.player1);

    // animate render position to new tile
    this.animatePlayerMove(this.player1, targetX, targetY);

    // update minimap marker and UI
    if (this.mapRenderer) {
      this.mapRenderer.setPlayer(this.playerWorldX, this.playerWorldY);
      this.mapRenderer.update();
    }

    // run tile checks for the new room
    // this.checkTileForItem(this.player1);
  }

  async onTileClick(x: number, y: number, tileInfo: any) {
    if (this.map.tiles[x][y].item != null) {
      const pickedUp = await this.inventory.floorItemActionPrompt(x, y);
      if (pickedUp) {
        this.removeItem(x, y);
      }
    }
  }
}