import { range } from 'rxjs';
import { Entity } from './entity';
import { GameController } from './game.controller';
import { Player } from './player';

export class BasicEnemyAI extends Entity {
  meleePreference = false;
  canMeleeAttack = true;
  canRangeAttack = true;
  patrolWhenIdle = true;
  triggersTraps = true;
  maxEnergy = 5;
  sightRange = 10;
  hostile = false;
  // 0 - No faction (ignores all, ignored by all)
  // 1 - Humans (escapists)
  // 2 - Abominations
  // 3 - Humans (facility workers)
  // 4 - Bots
  factionID = 0;
  //these values shouldn't be changed
  stunned = 0;
  parentEntity: Entity | null = null;
  alerted = false;
  energy = 0
  Targets: Entity[] = [];
  LastKnownTargetCoords: [number, number] | null = null;

  async aiTurn(): Promise<void> {

    if (!GameController.current) return;
    const controller = GameController.current;

    // find a potentail patrol position
    const patrolPos = this.findRandomPatrolPos();

    // update targets list
    this.handleTargets()
    let target = this.Targets[0];
    let distanceToTarget = controller.getDistance(this.posX,this.posY,target.posX,target.posY)
    let attackRange = 0
    let capableOfCombat = false
    // 0-None 1-Approach 2-Back away 3-Retreat
    let movementBehavior = 0;

    // NPC decision making when an enemy is found
    if(this.Targets.length > 0){
      if (this.inventory.weaponSlot != null){
        capableOfCombat = true;
        attackRange = this.inventory.weaponSlot?.range
      }

      if(capableOfCombat==false){
        movementBehavior = 3
      }else if (distanceToTarget > attackRange){
        movementBehavior = 1
      }else if(distanceToTarget < attackRange*0.3){
        movementBehavior = 2
      }else{
        movementBehavior = 0
      }
      
    }

    this.energy = this.maxEnergy;

    // NPC turn behavior
    while (this.energy > 0) {

      // Waste energy when stunned first
      if (this.stunned > 0) {
        this.stunned -= 1;
        this.energy = 0;
        if (this.stunned < 0) {
          this.stunned = 0;
        }
      }

      distanceToTarget = controller.getDistance(this.posX,this.posY,target.posX,target.posY)

      // NPC enemy behavior
      if (this.alerted && this.Targets.length > 0) {
        // if next to target attack with melee or retreat
        if (distanceToTarget <= 1) {
          if (this.canMeleeAttack == false) {
            this.backAwayFrom(target.posX, target.posY);
          } else {
            this.MeleeAttack();
          }
        // if we don't move then attack if possible  
        }else if(movementBehavior == 0){
          if (distanceToTarget <= this.inventory.weaponSlot?.range!) {
            this.RangedAttack(target)
          }
        }
        // approach behavior
        else if(movementBehavior == 1){
          if(await this.moveToPosition(target.posX,target.posY)==true){
            // try to move to around 2/3 range
            distanceToTarget = controller.getDistance(this.posX,this.posY,target.posX,target.posY)
            if(distanceToTarget < attackRange*0.7){
              movementBehavior=0
            }
          }else{
            // if we fail then stop
            movementBehavior=0
          }
        }
        // back away behavior
        else if(movementBehavior == 2){
          if(await this.backAwayFrom(target.posX, target.posY)==true){
            // stop if it gets too far
            distanceToTarget = controller.getDistance(this.posX,this.posY,target.posX,target.posY)
            if(distanceToTarget >= attackRange*0.7){
              movementBehavior=0
            }
          }else{
            // if we fail then stop
            movementBehavior=0
          }
        }
        // retreat behavior
        else if(movementBehavior == 3){
          //not implemented yet
        }
      // Check last known enemy position if one exists
      } else if (this.LastKnownTargetCoords) {
        this.moveToPosition(this.LastKnownTargetCoords[0],this.LastKnownTargetCoords[1],);
        if (this.posX == this.LastKnownTargetCoords[0] && this.posY == this.LastKnownTargetCoords[1]) {
          this.LastKnownTargetCoords = null;
        }
      // Patrol when nothing else to do
      } else if (this.patrolWhenIdle) {
        if (patrolPos != null) {
          await this.moveToPosition(patrolPos![0], patrolPos![1]);
          if (this.posX == patrolPos![0] && this.posY == patrolPos![1]) {
            this.energy = 0;
          }
        } else {
          this.energy = 0;
        }
      }
      await (controller.delay?.(500) ??
      new Promise((res) => setTimeout(res, 500)));
      controller.drawGrid?.();
      controller.drawPlayer?.();
      this.energy -= 1;
    }
    this.onAiTurnEnd();
  }

  removeEntity(x: number, y: number) {
    const controller = GameController.current;
    if (!controller || !controller.map) return;
    if (!controller.map.isValidTile(x, y)) return;
    const tile = controller.map.tiles[x][y];
    if (!tile) return;

    const ents = tile.entity as any;
    if (!ents) return;

    // handle both array or single-entity cases defensively
    if (Array.isArray(ents)) {
      for (let i = ents.length - 1; i >= 0; i--) {
        if (ents[i] === this) {
          ents.splice(i, 1);
        }
      }
      // ensure array remains (empty array is fine)
      tile.entity = ents;
    } else {
      if (ents === this) {
        tile.entity = [];
      }
    }
  }

  handleTargets() {
		this.Targets = []
		let detectionRange = this.sightRange
		if (this.alerted == true){
			detectionRange = this.sightRange * 2
		}
    let entities: any[] = [];
    let tiles = GameController.current?.getTilesInSphere(this.posX,this.posY,detectionRange,)!;
    tiles.forEach((tile) => {
      if (!GameController.current) return;
      if (
        GameController.current?.isLOSObstructed(
          this.posX,
          this.posY,
          tile[0],
          tile[1],
          true,
          true,
        ) == false
      ) {
        entities = GameController.current?.getAllEntitiesOnTile(
          tile[0],
          tile[1],
        );
        for (let i = 0; i < entities!.length; i++) {
          if (entities![i] instanceof BasicEnemyAI || entities![i] instanceof Player) {
            if (
              (this.factionID == 4 && entities![i].factionID < 3) ||
              (this.factionID == 3 && entities![i].factionID < 3) ||
              (this.factionID == 2 && entities![i].factionID != 2) ||
              (this.factionID == 1 && entities![i].factionID != 1)
            ){
              this.alerted = true;
							this.Targets.push(entities![i]);
						}
          }
        }
				//this.Targets.sort((a: Entity, b: Entity) => a.health - b.health)
				if (this.Targets.length > 0){
					this.LastKnownTargetCoords = [this.Targets![0].posX, this.Targets![0].posY];
				}
      }
    });
    if (this.Targets.length == 0){
      this.alerted = false;
    }
  }

  findRandomPatrolPos() {
    const controller = GameController.current;
    if (!controller) return null;

    let positionFound = false;

    while (positionFound == false) {
      const randomX = this.posX + Math.floor(Math.random() * 7) - 3;
      const randomY = this.posY + Math.floor(Math.random() * 7) - 3;
      if (
        controller.map &&
        controller.map.isValidTile(randomX, randomY) &&
        controller.isTileWalkable(randomX, randomY)
      ) {
        positionFound = true;
        return [randomX, randomY];
      }
    }
    return null;
  }

  async backAwayFrom(posX: number, posY: number) {
    const dx = this.posX - posX;
    const dy = this.posY - posY;
    const nx = this.posX + (dx > 0 ? 1 : dx < 0 ? -1 : 0);
    const ny = this.posY + (dy > 0 ? 1 : dy < 0 ? -1 : 0);
    if(await this.moveToPosition(nx, ny)==true){
      return true
    }else{
      return false
    }
  }

  async moveToPosition(targetX: number, targetY: number) {
    const controller = GameController.current;
    const path = controller!.findPathAStar(
      this.posX,
      this.posY,
      targetX,
      targetY,
    );
    if (!path || path.length <= 1) {
      return false;
    }
    if (!controller) return false;

    // move up to `energy` steps along the path
    const steps = 1; //maybe will be changed later
    for (let step = 1; step <= steps; step++) {
      const [nx, ny] = path[step];

      // safety checks: bounds and walkability
      if (!controller!.map || !controller!.map.isValidTile(nx, ny)) return false;

      // if there's a door on the next tile, try to open it
      const door = controller!.getDoorOnTile(nx, ny);
      if (door) {
        if (typeof door.onUse === 'function') {
          if (door.open == false) {
            door.onUse();
            this.energy -= 1;
          }
        }
        controller!.drawGrid?.();
        controller!.drawPlayer?.();
      }

      if (!controller!.isTileWalkable(nx, ny)) return false;

      this.removeEntity(this.posX, this.posY);
      controller!.loadEntity(nx, ny, this, controller!.map);

      // redraw and pause
      controller!.drawGrid?.();
      controller!.drawPlayer?.();

      if (nx === targetX && ny === targetY) {
        return true;
      }
    }
    return true;
  }

  RangedAttack(target: Entity) {
    this.inventory.weaponSlot?.use(target);
  }

  MeleeAttack() {

  }
  
  onAiTurnEnd(){
    
  }

}