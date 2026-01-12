import { range } from "rxjs";
import { Entity } from "./entity";
import { GameController } from "./game.controller";
import { Player } from "./player";
import { Torso } from "./health/limbs";
import { Lacerations } from "./health/afflictions";
import { LimbName } from "./health/health";

export class BasicEnemyAI extends Entity{
    parentEntity: Entity | null = null;
    alerted = false;
    hostile = false;
    meleePreference = false;
    TargetCoords: Entity[] = [];
    LastKnownTargetCoords: [number, number] | null = null;
    energy = 3;
    sightRange = 7;
    attackRange = 3;
    damage = 1;
    accuracy = 0.1; //chance to miss


       async Main(): Promise<void> {
        
        if (!GameController.current) return;
        // update target list
        this.findTargets();

        const controller = GameController.current;
        const pauseMs = (controller as any).enemyStepDelay ?? 160;

        if (this.alerted && this.TargetCoords.length > 0) {
            // Has current targets: pursue and attack as before
            const target = this.TargetCoords[0] as Player;

            const distanceToTarget = Math.max(Math.abs(this.posX - target.posX), Math.abs(this.posY - target.posY));

            // If in ranged attack window (but not adjacent) -> ranged attack
            if (distanceToTarget <= this.attackRange && distanceToTarget > 1) {
                this.RangedAttack();
               // show action
               controller.drawGrid?.();
               controller.drawPlayer?.();
               await (controller.delay?.(pauseMs) ?? new Promise(res => setTimeout(res,pauseMs)));
              return;
            }

            // If adjacent -> melee
            if (distanceToTarget === 1) {
                this.MeleeAttack();
               controller.drawGrid?.();
               controller.drawPlayer?.();
               await (controller.delay?.(pauseMs) ?? new Promise(res => setTimeout(res,pauseMs)));
              return;
            }

            // Otherwise: path towards the player using A* and spend movement (energy)
            const path = controller.findPathAStar(this.posX, this.posY, target.posX, target.posY);
            if (!path || path.length <= 1) return; // no movement possible

            // move up to `energy` steps along the path (path[0] == start)
            const steps = Math.min(this.energy, path.length - 1);
            for (let step = 1; step <= steps; step++) {
                const [nx, ny] = path[step];

                // safety checks: bounds and walkability
                if (!controller.map || !controller.map.isValidTile(nx, ny)) break;

                // if there's a door on the next tile and it's closed, try to open it and stop moving this turn
                const door = controller.getDoorOnTile(nx, ny);

                if (door) {
                    if (typeof door.onUse === "function") {
                        if(door.open == false){
                           door.onUse(); 
                        }
                    }
                    // redraw + pause so player sees the open attempt
                    controller.drawGrid?.();
                    controller.drawPlayer?.();
                    await (controller.delay?.(pauseMs) ?? new Promise(res => setTimeout(res,pauseMs)));
                    
                 }

                // allow stepping onto the goal even if occupied by non-walkable (attack intent),
                // otherwise require walkable
                const isGoal = (nx === target.posX && ny === target.posY);
                if (!isGoal && !controller.isTileWalkable(nx, ny)) break;

                // remove from current tile and place at new tile via controller API
                this.removeEntity(this.posX, this.posY);
                controller.loadEntity(nx, ny, this, controller.map);

                // redraw and pause after each step so player can observe movement
                controller.drawGrid?.();
                controller.drawPlayer?.();
                await (controller.delay?.(pauseMs) ?? new Promise(res => setTimeout(res,pauseMs)));

                // after moving check current distance to the (possibly moved) player
                const postDistance = Math.max(Math.abs(this.posX - target.posX), Math.abs(this.posY - target.posY));
                if (postDistance <= this.attackRange) {
                    // if within melee range do melee, otherwise ranged
                    if (postDistance === 1) {
                        this.MeleeAttack();
                    } else {
                        this.RangedAttack();
                    }
                    // show attack and pause, then stop further movement this turn
                    controller.drawGrid?.();
                    controller.drawPlayer?.();
                    await (controller.delay?.(pauseMs) ?? new Promise(res => setTimeout(res,pauseMs)));
                    break;
                }
            }
        } else if (this.LastKnownTargetCoords) {
            // No current targets, but has last known position: move towards it
            const [lx, ly] = this.LastKnownTargetCoords;
            const path = controller.findPathAStar(this.posX, this.posY, lx, ly);
            if (!path || path.length <= 1) {
                // Can't reach last known, clear it
                this.LastKnownTargetCoords = null;
                return;
            }

            // move up to `energy` steps along the path
            const steps = Math.min(this.energy, path.length - 1);
            for (let step = 1; step <= steps; step++) {
                const [nx, ny] = path[step];

                // safety checks: bounds and walkability
                if (!controller.map || !controller.map.isValidTile(nx, ny)) break;

                // if there's a door on the next tile, try to open it
                const door = controller.getDoorOnTile(nx, ny);
                if (door) {
                    
                    if (typeof door.onUse === "function") {
                        if(door.open == false){
                           door.onUse(); 
                        }
                    }
                    controller.drawGrid?.();
                    controller.drawPlayer?.();
                    await (controller.delay?.(pauseMs) ?? new Promise(res => setTimeout(res,pauseMs)));
                    
                }

                // require walkable (since no attack intent here)
                if (!controller.isTileWalkable(nx, ny)) break;

                // move
                this.removeEntity(this.posX, this.posY);
                controller.loadEntity(nx, ny, this, controller.map);

                // redraw and pause
                controller.drawGrid?.();
                controller.drawPlayer?.();
                await (controller.delay?.(pauseMs) ?? new Promise(res => setTimeout(res,pauseMs)));

                // if reached last known, clear it
                if (nx === lx && ny === ly) {
                    this.LastKnownTargetCoords = null;
                    break;
                }
            }
        }
        // else: no targets and no last known, do nothing
    }

    removeEntity(x: number, y: number) {
        const controller = GameController.current;
        if (!controller || !controller.map) return;
        if (!controller.map.isValidTile(x, y)) return;
        const tile = controller.map.tiles[x][y];
        if (!tile) return;

        const ents = (tile.entity as any);
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

    findTargets(){
        let temp = 0;
        let allEntities : Entity[] = [] ;
        let entities : Entity[] = [] ;
        let tiles = GameController.current?.getTilesInSphere(this.posX,this.posY,this.sightRange)!
            tiles.forEach((tile) => {
                if (!GameController.current) return;
            if (GameController.current?.isLOSObstructed(this.posX,this.posY,tile[0],tile[1],true,true)==false){
                entities = GameController.current?.getAllEntitiesOnTile(tile[0],tile[1])
                allEntities = allEntities?.concat(entities) ;
                  for (let i=0;i<entities!.length;i++){
                    if (entities![i] instanceof Player){
                        this.alerted=true;
                        if (!this.TargetCoords.includes(entities![i])){
                            this.TargetCoords.push(entities![i]);
                        }
                        // update last known position
                        this.LastKnownTargetCoords = [entities![i].posX, entities![i].posY];
                    }
                }
            }
            
            });
            for (let i=0;i<allEntities.length;i++){
                if (allEntities[i] instanceof Player){
                    temp = 1;
                }
            }
            if (temp==0){
                this.alerted=false;
                this.TargetCoords = [];
                // do not clear LastKnownTargetCoords here
            }
    }
    RangedAttack(){
        
        let targetLimb: LimbName = "torso";
        let miss = Math.random(); //chance to miss or hit random limb
        if (miss < this.accuracy){
            return; //missed attack
        }
        else if (miss < this.accuracy*2){
            const limbs: LimbName[] = ["head","leftArm","rightArm","leftLeg","rightLeg"];
            const randomIndex = Math.floor(Math.random() * limbs.length);
            targetLimb = limbs[randomIndex];
        }
        const controller = GameController.current;
        if (!controller) return;
        if (this.TargetCoords.length == 0) return;
        const target = this.TargetCoords[0] as Player;
        let damageDealt = this.damage;
        target.Health.damageLimb(targetLimb,[['Lacerations',damageDealt]]);
        
    }

    MeleeAttack(){
        let targetLimb: LimbName = "torso";
        let miss = Math.random(); //chance to miss or hit random limb
        if (miss < this.accuracy){
            return; //missed attack
        }
        else if (miss < this.accuracy*2){
            const limbs: LimbName[] = ["head","leftArm","rightArm","leftLeg","rightLeg"];
            const randomIndex = Math.floor(Math.random() * limbs.length);
            targetLimb = limbs[randomIndex];
        }
        const controller = GameController.current;
        if (!controller) return;
        if (this.TargetCoords.length == 0) return;
        const target = this.TargetCoords[0] as Player;
        let damageDealt = this.damage*2;
        target.Health.damageLimb(targetLimb,[['Lacerations',damageDealt],]);
        
    }

}

export class LightInterferanceUnitAI extends BasicEnemyAI {
    override hostile = true;
    override meleePreference = false;
    override energy = 3;
    override sightRange = 5;
    override attackRange = 3;
    override damage = 1;
    override accuracy = 0.1; //chance to miss

    override RangedAttack(){
        
        let targetLimb: LimbName = "torso";
        let miss = Math.random(); //chance to miss or hit random limb
        if (miss < this.accuracy){
            return; //missed attack
        }
        else if (miss < this.accuracy*2){
            const limbs: LimbName[] = ["head","leftArm","rightArm","leftLeg","rightLeg"];
            const randomIndex = Math.floor(Math.random() * limbs.length);
            targetLimb = limbs[randomIndex];
        }
        const controller = GameController.current;
        if (!controller) return;
        if (this.TargetCoords.length == 0) return;
        const target = this.TargetCoords[0] as Player;
        let damageDealt = this.damage;
        target.Health.damageLimb(targetLimb,[['Lacerations',damageDealt*2],['Bleeding',damageDealt*2]]);
        target.Health.torso.zapped.increaseSeverity(damageDealt*5);
    }

    override MeleeAttack(){
        let targetLimb: LimbName = "torso";
        let miss = Math.random(); //chance to miss or hit random limb
        if (miss < this.accuracy){
            return; //missed attack
        }
        else if (miss < this.accuracy*2){
            const limbs: LimbName[] = ["head","leftArm","rightArm","leftLeg","rightLeg"];
            const randomIndex = Math.floor(Math.random() * limbs.length);
            targetLimb = limbs[randomIndex];
        }
        const controller = GameController.current;
        if (!controller) return;
        if (this.TargetCoords.length == 0) return;
        const target = this.TargetCoords[0] as Player;
        let damageDealt = this.damage*2;
        target.Health.damageLimb(targetLimb,[['Lacerations',damageDealt*2],['Bleeding',damageDealt*2]]);
        target.Health.torso.zapped.increaseSeverity(damageDealt*5);
    }
}

export class MediumInterferanceUnitAI extends BasicEnemyAI {
    override hostile = true;
    override meleePreference = false;
    override energy = 3;
    override sightRange = 7;
    override attackRange = 4;
    override damage = 5;
    override accuracy = 0.4; //chance to miss
    burst = 4; //number of shots in a burst

    override RangedAttack(){
        
        let targetLimb: LimbName = "head";
        for (let i=0;i<this.burst;i++){
            let miss = Math.random(); //chance to miss or hit random limb
        if (miss < this.accuracy){
            return; //missed attack
        }
        else if (miss < this.accuracy*2){
            const limbs: LimbName[] = ["torso","leftArm","rightArm","leftLeg","rightLeg"];
            const randomIndex = Math.floor(Math.random() * limbs.length);
            targetLimb = limbs[randomIndex];
        }
        const controller = GameController.current;
        if (!controller) return;
        if (this.TargetCoords.length == 0) return;
        const target = this.TargetCoords[0] as Player;
        let damageDealt = this.damage;
        target.Health.damageLimb(targetLimb,[['GunshotWound',damageDealt],['Bleeding',damageDealt*5]]);
        }
        
        
    }

    override MeleeAttack(){
        let targetLimb: LimbName = "head";
        let miss = Math.random(); //chance to miss or hit random limb
        if (miss < this.accuracy){
            return; //missed attack
        }
        else if (miss < this.accuracy*2){
            const limbs: LimbName[] = ["torso","leftArm","rightArm","leftLeg","rightLeg"];
            const randomIndex = Math.floor(Math.random() * limbs.length);
            targetLimb = limbs[randomIndex];
        }
        const controller = GameController.current;
        if (!controller) return;
        if (this.TargetCoords.length == 0) return;
        const target = this.TargetCoords[0] as Player;
        let damageDealt = 10;
        target.Health.damageLimb(targetLimb,[['Lacerations',damageDealt*2],['Bleeding',damageDealt*5]]);
  
    }
}

