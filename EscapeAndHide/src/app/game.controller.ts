import { Application, Graphics, Container } from 'pixi.js';
import { GameGrid } from './grid';
import { Player } from './player';
import { Health } from './health/health';
import { Text, Sprite, Assets } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { Energy } from './energy/energy';
import { Items } from './items/items';
import { inventoryRendering } from './inventory/inventoryRendering';
import { World } from './world';
import { WeaponFunctionality } from './items/weapon_functionality';
import { Dummy } from './dummy';

export class GameController {
  app!: Application;
  map!: GameGrid;
  inventory!: inventoryRendering;
  weaponFunctionality = new WeaponFunctionality();
  player1 = new Player(1, 1, '1', new Health(5.0, 4.0), new Energy(100, 100));
  world = new World();

  dummy1 = new Dummy(5, 2, '1', 10.0);
  gridContainer = new Container();
  effectContainer = new Container();
  entityContainer = new Container();
  playerSprite = new Graphics();

  healthBar = new Graphics();
  energyBar = new Graphics();
  tile = new Graphics();
  playerWorldX = 5;
  playerWorldY = 5;
  tileSize = 32; // Size of each tile in pixels

  constructor() {}

  async init(container: HTMLDivElement): Promise<void> {

;
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
    await Assets.load('enemy1.png');
    await Assets.load('glass_shards.png');

 
    this.world.CreateWorld();
    // Create map and player

    this.map = this.world.rooms[5][5];
    
    console.log(this.map.width + " " + this.map.height);
    this.map.loadPlayer(1, 1, this.player1);

    // Create PIXI app
    this.app = new Application();
    await this.app.init({
      width: this.tileSize * 30,
      height: this.tileSize * 30,
      backgroundColor: 0x222222,
      antialias: true,
      resizeTo: window
    });
    
    container.appendChild(this.app.canvas as HTMLCanvasElement);

    // Create map and player
    
    this.map.loadPlayer(1, 1, this.player1);
    this.map.loadDummy(5, 2, this.dummy1);

    this.map.SpawnItem(1, 3, new Items().gun);
    this.map.SpawnItem(2, 3, new Items().bigGun);

    this.map.tiles[3][3] = this.map.getTileData("glass_shards");
    
    // Draw grid, player and dummy
    this.drawGrid();
    this.drawPlayer();
    

    // Add containers to stage
    this.app.stage.addChild(this.gridContainer);
    this.app.stage.addChild(this.effectContainer);
    this.app.stage.addChild(this.entityContainer);
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

    async generateRoom(x: number, y: number)  {
    this.map = new GameGrid(x,y);
    this.map.createEmptyMap()
    this.map.loadPlayer(1, 1, this.player1);

  }

  generateRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  clampNumber(number: number, min: number, max: number){
    if(number < min){
      return min
    }else if(number > max){
      return max
    }
    return number
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

    this.energyBar.endFill();
  }

  drawGrid() {
    this.gridContainer.removeChildren();
    this.tile.clear();
    this.entityContainer.removeChildren();
    
    for (let x = 0; x < this.map.width; x++) {
      for (let y = 0; y < this.map.height; y++) {

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

        if (this.map.tiles[x][y].entity != null){
          if(this.map.tiles[x][y].entity instanceof Player){
          }else{
          let texture = Assets.get("enemy1.png");
          let sprite = new PIXI.Sprite(texture);
          sprite.x = x * this.tileSize;
          sprite.y = y * this.tileSize;
          sprite.width = this.tileSize;
          sprite.height = this.tileSize;
          sprite._zIndex = 2;
          this.entityContainer.addChild(sprite);
          if (this.isLineObstructed(this.player1.PosX, this.player1.PosY, x, y,true,true)==true){
           sprite.alpha = 0
          }
          else if(this.isLineObstructed(this.player1.PosX, this.player1.PosY, x, y,true,true)==false){
            sprite.alpha = 1
          }
          }
        }

        if (this.map.tiles[x][y].sprite != '') {
          let texture = Assets.get(this.map.tiles[x][y].sprite.toString());
          let sprite = new PIXI.Sprite(texture);
          sprite.x = x * this.tileSize;
          sprite.y = y * this.tileSize;
          sprite.width = this.tileSize;
          sprite.height = this.tileSize;
          sprite._zIndex = 1;
          this.gridContainer.addChild(sprite);
          if (this.map.tiles[x][y].hiddenOutsideLOS==true && this.isLineObstructed(this.player1.PosX, this.player1.PosY, x, y,true,true)==true){
           sprite.alpha = 0
          }
          /*else if(this.map.tiles[x][y].hiddenOutsideLOS==false && this.isLineObstructed(this.player1.PosX, this.player1.PosY, x, y,true,true)==true){
            sprite.alpha = 0.5
          }*/
          else if(this.isLineObstructed(this.player1.PosX, this.player1.PosY, x, y,true,true)==false){
            sprite.alpha = 1
          }
        }

        let firevalue = this.map.tiles[x][y].fireValue
        if (firevalue>0) {
          let fireTexture = Assets.get("fire_small.png");
          if (firevalue > 66){
            fireTexture = Assets.get("fire_large.png");
          }
          else if(firevalue > 33){
            fireTexture = Assets.get("fire_medium.png");
          }
          let fireSprite = new PIXI.Sprite(fireTexture);
          fireSprite.x = (x * this.tileSize)
          fireSprite.y = (y * this.tileSize)
          fireSprite.width = this.tileSize
          fireSprite.height = this.tileSize
          fireSprite._zIndex = 5
          this.gridContainer.addChild(fireSprite);
          if (this.map.tiles[x][y].hiddenOutsideLOS==true && this.isLineObstructed(this.player1.PosX, this.player1.PosY, x, y,true,true)==true){
           fireSprite.alpha = 0
          }
          else if(this.isLineObstructed(this.player1.PosX, this.player1.PosY, x, y,true,true)==false){
            fireSprite.alpha = 1
          }
        }
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

  teleportPlayer(player: Player, targetX: number, targetY: number) {
    let playerPosX = player.PosX;
    let playerPosY = player.PosY;
    if(playerPosX < this.map.width && playerPosY < this.map.height){
      this.map.tiles[playerPosX][playerPosY].entity = null;
    }
    
    player.PosX = targetX;
    player.PosY = targetY;
    this.map.tiles[targetX][targetY].entity = player;
    this.animatePlayerMove(player, targetX, targetY);
    //player.playerAction(10);
    this.checkUnderPlayer(player);
    console.log("Player teleported to: " + player.PosX + ", " + player.PosY);
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
    if (
      targetX < 0 ||
      targetY < 0 ||
      targetX >= this.map.width ||
      targetY >= this.map.height ||
      this.map.tiles[targetX][targetY].hasCollision ||
      this.map.tiles[targetX][targetY].entity ||
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
    if (this.map.tiles[player.PosX][player.PosY].item != null) {
      console.log("truly")
      const item = this.map.tiles[player.PosX][player.PosY].item;
      if (item && confirm(`Pick up ${item.name}?`)) {
        this.inventory.pickUp(item.name, item.category, item.sprite);
        this.map.RemoveItem(
          player.PosX,
          player.PosY,
          this.map.tiles[player.PosX][player.PosY].effect
        );
      }
    }
 }

findRoom(player: Player){
    let playerPosX = player.PosX;
    let playerPosY = player.PosY;

    let mapX = this.map.width;
    let mapY = this.map.height;

    if(playerPosX == 0 && playerPosY < mapY){
      //left
      if (this.playerWorldX - 1  >= 0){
        this.map = this.world.rooms[this.playerWorldX-1][this.playerWorldY];
        this.playerWorldX -= 1;
        this.teleportPlayer(this.player1, this.map.width-2, Math.floor(this.map.height/2));
        console.log("Moved to left room");
        console.log("World coordinates: " + this.playerWorldX + ", " + this.playerWorldY);
      }
    }
    else if(playerPosX == mapX-1 && playerPosY < mapY){
      //right
      if (this.playerWorldX + 1  <= 10){
        this.map = this.world.rooms[this.playerWorldX+1][this.playerWorldY];
        this.playerWorldX += 1;
        this.teleportPlayer(this.player1, 1, Math.floor(this.map.height/2));
        console.log("Moved to right room");
        console.log("World coordinates: " + this.playerWorldX + ", " + this.playerWorldY);
      }
    }
    else if(playerPosY == 0 && playerPosX < mapX){
      //up
      if (this.playerWorldY + 1  <= 10){
        this.map = this.world.rooms[this.playerWorldX][this.playerWorldY+1];
        this.playerWorldY += 1;
        this.teleportPlayer(this.player1, Math.floor(this.map.width/2), this.map.height-2);
        console.log("Moved to up room");
        console.log("World coordinates: " + this.playerWorldX + ", " + this.playerWorldY);
      }
    }
    else if(playerPosY == mapY-1 && playerPosX < mapX){
      //down
      if (this.playerWorldY - 1  >= 0){
        this.map = this.world.rooms[this.playerWorldX][this.playerWorldY-1];
        this.playerWorldY -= 1;
        this.teleportPlayer(this.player1, Math.floor(this.map.width/2), 1);
        console.log("Moved to down room");
        console.log("World coordinates: " + this.playerWorldX + ", " + this.playerWorldY);
      }
    }
   
  }

  checkUnderPlayer(player: Player) {
    let tileEffect = this.map.tiles[player.PosX][player.PosY].effect;
    console.log('Tile effect: ' + tileEffect);
    switch (tileEffect) {
      case 'glass_shards':
        player.health.Damage(0, 1.0);
        return 'glass_shards';
      case 'fire':
        player.health.Damage(0, 2.0)
        return "fire"
      case 'entrance':
        this.findRoom(player);
        return "entrance"
      }

      return ""
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
      this.map.damageTile(x,y,this.map.tiles[x][y].fireValue/5)
      this.map.tiles[x][y].fireValue = this.clampNumber(this.map.tiles[x][y].fireValue - this.generateRandomNumber(10,20),0,100,)
      if (this.map.tiles[x][y].name=="empty"){
        this.map.createTile(x,y,"ash",true);
      }
      var spreadchance = this.generateRandomNumber(1,5)
      if (spreadchance==1){

        this.ignite(x+1,y,this.map.tiles[x+1][y].fireValue+40,false)
        this.ignite(x-1,y,this.map.tiles[x-1][y].fireValue+40,false)
        this.ignite(x,y+1,this.map.tiles[x][y+1].fireValue+40,false)
        this.ignite(x,y-1,this.map.tiles[x][y-1].fireValue+40,false)

      }
    }
  }

  ignite(x: number, y:number, fireValue: number, additive: boolean){
    if(this.map.isValidTile(x,y) && this.map.tiles[x][y].flammable == true){
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
            this.map.damageTile(tile[0],tile[1],strength/size)
            if(this.player1.PosX == tile[0] && this.player1.PosY == tile[1]){
              this.player1.health.Damage(strength/size/10)
            }
            var firechance=this.generateRandomNumber(1,10)
            if (firechance==1){
              this.ignite(tile[0],tile[1],strength,true)
            }
          }
        })
        await this.delay(50);
      }
      this.effectContainer.removeChildren();

    })();

  }

  endTurn(){
    this.updateAllTiles()
    this.checkUnderPlayer(this.player1)
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
          this.createExplosion(player.PosX,player.PosY,4,50,true)
          this.endTurn()
          break;
        default:
          return;
      }
    });
    window.addEventListener('click', (event) => {
      this.weaponFunctionality.attack(this.map.getTileCoords(event.clientX, event.clientY, this.tileSize),this.map);
      let x = this.map.getTileCoords(event.clientX, event.clientY, this.tileSize).x
      let y = this.map.getTileCoords(event.clientX, event.clientY, this.tileSize).y
      let tiles = this.castRay(player.PosX,player.PosY,x,y,true)
      tiles.forEach((tile) => {
        this.ignite(tile[0],tile[1],100,true)
      })
    })
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
