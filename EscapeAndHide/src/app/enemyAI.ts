import { range } from "rxjs";
import { Entity } from "./entity";
import { GameController } from "./game.controller";
import { Player } from "./player";
import { Torso } from "./health/limbs";
import { Lacerations } from "./health/afflictions";
import { LimbName } from "./health/health";
import { tile } from "./tile";
import { Boss1UnitLeg } from "./enemyTypes";

export class BasicEnemyAI extends Entity{
    
    parentEntity: Entity | null = null;
    alerted = false;
    hostile = false;
    meleePreference = false;
    nonMelee = false;
    stationary = false;
    isSubEntity = false;
    hasSubEntities = false;
    TargetCoords: Entity[] = [];
    LastKnownTargetCoords: [number, number] | null = null;
    energy = 3;
    sightRange = 7;
    attackRange = 3;
    optimalRange = 2;
    damage = 1;
    accuracy = 0.1; //chance to miss
    stunned = 0;
    

    async aiTurn(){
        await this.Main();
    }
    
       async Main(): Promise<void> {
        
        if (this.stunned > 0){
            this.stunned -= 1;
            if (this.stunned < 0){
                this.stunned = 0;
            }
            return;
        }
        if (!GameController.current) return;
        // update target list
        this.findTargets();

        const controller = GameController.current;
        const pauseMs = (controller as any).enemyStepDelay ?? 360;

        

        if (this.alerted && this.TargetCoords.length > 0) {
            // Has current targets: pursue and attack as before
            const target = this.TargetCoords[0] as Player;

            const dx = Math.abs(this.posX - target.posX);
            const dy = Math.abs(this.posY - target.posY);
            const distanceToTarget = Math.ceil(Math.max(dx, dy) + 0.5 * Math.min(dx, dy));
                // If this entity is stationary, only perform attacks (no movement)
                if (this.stationary) {
                    if (distanceToTarget <= this.attackRange) {
                        if (distanceToTarget === 1) {
                            this.MeleeAttack();
                        } else {
                            this.RangedAttack();
                        }
                        controller.drawGrid?.();
                        controller.drawPlayer?.();
                        await (controller.delay?.(pauseMs) ?? new Promise(res => setTimeout(res,pauseMs)));
                    }
                    return;
                }
            
            // If too close for ranged attack, move away
            if (this.meleePreference == false && distanceToTarget < this.optimalRange) {
               // console.log("Moving away to maintain attack range");
                // For ranged enemies, if player is too close, move away to optimal range
                const dx = this.posX - target.posX;
                const dy = this.posY - target.posY;
                const nx = this.posX + (dx > 0 ? 1 : dx < 0 ? -1 : 0);
                const ny = this.posY + (dy > 0 ? 1 : dy < 0 ? -1 : 0);
                
                // Check if the new position is valid and walkable
                if (controller.map && controller.map.isValidTile(nx, ny) && controller.isTileWalkable(nx, ny)) {
                    // Move away
                    this.removeEntity(this.posX, this.posY);
                    controller.loadEntity(nx, ny, this, controller.map);
                    // Redraw and pause
                    controller.drawGrid?.();
                    controller.drawPlayer?.();
                    await (controller.delay?.(pauseMs) ?? new Promise(res => setTimeout(res,pauseMs)));
                }
                return;
            }

            // If in ranged attack window -> ranged attack
            if (distanceToTarget <= this.attackRange && distanceToTarget >= this.optimalRange && this.meleePreference == false) {
               // console.log("In ranged attack range");
               // console.log("Distance to target: " + distanceToTarget);
                this.RangedAttack();
               // show action
               controller.drawGrid?.();
               controller.drawPlayer?.();
               await (controller.delay?.(pauseMs) ?? new Promise(res => setTimeout(res,pauseMs)));
              return;
            }
            
           
            // If adjacent -> melee
            if (distanceToTarget === 1 ) {
                if (this.nonMelee == true){
                    // For non-melee enemies, if player is too close, move away to attack range
                    const dx = this.posX - target.posX;
                    const dy = this.posY - target.posY;
                    const nx = this.posX + (dx > 0 ? 1 : dx < 0 ? -1 : 0);
                    const ny = this.posY + (dy > 0 ? 1 : dy < 0 ? -1 : 0);
                    
                    // Check if the new position is valid and walkable
                    if (controller.map && controller.map.isValidTile(nx, ny) && controller.isTileWalkable(nx, ny)) {
                        // Move away
                        this.removeEntity(this.posX, this.posY);
                        controller.loadEntity(nx, ny, this, controller.map);
                        // Redraw and pause
                        controller.drawGrid?.();
                        controller.drawPlayer?.();
                        await (controller.delay?.(pauseMs) ?? new Promise(res => setTimeout(res,pauseMs)));
                    }
                }else{
                    this.MeleeAttack();
                    return
                }
                
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

    override async RangedAttack(){
        
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
        // Add 0.5 second cooldown between shots
        await controller.delay?.(200) ?? new Promise(res => setTimeout(res,200));
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

export class HeavyInterferanceUnitAI extends BasicEnemyAI {
    override hostile = true;
    override meleePreference = false;
    override energy = 2;
    override sightRange = 8
    override attackRange = 5;
    override optimalRange = this.attackRange-2;
    override damage = 10
    override accuracy = 0.6; //chance to miss
    burst = 4; //number of shots in a burst
    controller = GameController.current;
    

    getRandomTileInRadius(radius: number){
        const target = this.TargetCoords[0] as Player;
        if (!this.controller) return null;
        const tiles = this.controller.getTilesInSphere(target.posX,target.posY,radius);
        if (tiles.length == 0) return null;
        const randomIndex = Math.floor(Math.random() * tiles.length);
        return tiles[randomIndex];
    }

    override async RangedAttack(){
        this.controller = GameController.current;
        if (this.controller == null) {
            return
        };
        let explosionRadius = 2;
        let missRadius = 3;
        let attackRadius = 2;

        
        for (let i=0;i<this.burst;i++){
            
            let miss = Math.random(); //chance to miss or hit random limb
        if (miss < this.accuracy){
            let missTile = this.getRandomTileInRadius(missRadius);
            if (missTile) {
                this.controller.createExplosion(missTile[0], missTile[1], explosionRadius, this.damage);
            }
        }
        else {
            let attackTile = this.getRandomTileInRadius(attackRadius);
            if (attackTile) {
                this.controller.createExplosion(attackTile[0], attackTile[1], explosionRadius, this.damage);
            }
           
        }
        // Add 0.5 second cooldown between shots
        await this.controller.delay?.(200) ?? new Promise(res => setTimeout(res,200));
        
        if (this.TargetCoords.length == 0) return;
       
        }
        this.stunned += 1; //heavy unit stuns itself after attack
    }
}

export class OppressorUnitAI extends BasicEnemyAI {
    override hostile = true;
    override meleePreference = true;
    override energy = 2;
    override sightRange = 6;
    override damage = 30;
    override accuracy = 0.05; //chance to miss
 
    override MeleeAttack(){
        let damageDealt = this.damage;
        let targetLimb: LimbName = "torso";
        let miss = Math.random(); //chance to miss or hit random limb
        let stunChance = Math.random(); //chance to stun
        if (miss < this.accuracy){
            return; //missed attack
        }
        else if (miss < this.accuracy*2){
            const limbs: LimbName[] = ["head","leftArm","rightArm","leftLeg","rightLeg"];
            const randomIndex = Math.floor(Math.random() * limbs.length);
            targetLimb = limbs[randomIndex];
            damageDealt = damageDealt / 2;
        }
        const controller = GameController.current;
        if (!controller) return;
        if (this.TargetCoords.length == 0) return;
        const target = this.TargetCoords[0] as Player;
        
        target.Health.damageLimb(targetLimb,[['Fracture',damageDealt]]);
        if (stunChance < 0.3){
            target.Health.torso.zapped.increaseSeverity(20);//change to stun affliction later
        }
  
    }
}

export class TrapperUnitAI extends BasicEnemyAI {
    override hostile = false;
    override meleePreference = false;
    override energy = 5;
    override sightRange = 2;
    override attackRange = 2;
    override damage = 1;
    override accuracy = 0.1; //chance to miss
}

 export class ScorcherUnitAI extends BasicEnemyAI {
    override hostile = true;
    override meleePreference = false
    override nonMelee = true;
    override energy = 3;
    override sightRange = 6;
    override attackRange = 3;
    override damage = 5;
   

    getConeTiles(centerX: number, centerY: number, range: number, angle: number, coneAngle: number): [number, number][] {
        const tiles: [number, number][] = [];
        const controller = GameController.current;
        for (let x = centerX - range; x <= centerX + range; x++) {
            for (let y = centerY - range; y <= centerY + range; y++) {
                const dx = Math.abs(x - centerX);
                const dy = Math.abs(y - centerY);
                const dist = Math.ceil(Math.max(dx, dy) + 0.5 * Math.min(dx, dy));
                if (dist > range || dist === 0) continue; // exclude center

                // skip tiles that are out of the current map bounds
                if (controller && controller.map && !controller.map.isValidTile(x, y)) continue;

                const angleToTile = Math.atan2(y - centerY, x - centerX);
                let angleDiff = angleToTile - angle;
                // Robust normalization to [-PI, PI]
                while (angleDiff <= -Math.PI) angleDiff += 2 * Math.PI;
                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                // small epsilon to avoid cutting off exact-edge tiles due to fp errors
                const eps = 1e-9;
                if (Math.abs(angleDiff) <= coneAngle / 2 + eps) {
                    tiles.push([x, y]);
                }
            }
        }
        return tiles;
    }

    override RangedAttack(){
        const controller = GameController.current;
        if (!controller || this.TargetCoords.length === 0) return;
        const target = this.TargetCoords[0] as Player;
        const dx = target.posX - this.posX;
        const dy = target.posY - this.posY;
        const angleToTarget = Math.atan2(dy, dx);
        const coneTiles = this.getConeTiles(this.posX, this.posY, this.attackRange+2, angleToTarget, Math.PI / 3 ); // 60 degree cone

        for (const [x, y] of coneTiles) {
            // Apply damage or effect, e.g., create fire or damage entities
            const entities = controller.getAllEntitiesOnTile(x, y);
            let tileRange = Math.max(Math.abs(x - this.posX), Math.abs(y - this.posY));
            let fireChance = controller.generateRandomNumber(1, tileRange);
            if (fireChance <= 2){
                controller.ignite(x, y, (100 - tileRange*15), true, true); 
            }
            
            for (const entity of entities) {
                if (entity instanceof Player) {
                    // Damage player, perhaps with fire damage
                    // For now, use existing damage logic
                   
                   
                }
            }
        }
        
        this.stunned += 1; //scorcher stuns itself after attack
        console.log("Scorcher used Ranged Attack and is stunned for "+ this.stunned+" turn.");
    }
}

 export class Boss1AI extends BasicEnemyAI {
        override hostile = true;
        override meleePreference = false;
        override energy = 4;
        override sightRange = 20;
        override attackRange = 10;
        override damage = 30;
        override accuracy = 0.2; //chance to miss
        override hasSubEntities = true;

        activateSubEntities = false;

        subEnentities: Entity[] = [];

        // visually occupy 2x2 tiles
        override footprintWidth = 2;
        override footprintHeight = 2;

        burst = 2; //number of shots in a burst
        controller = GameController.current;
        
        // Track last position for movement direction
        lastPosX: number = 0;
        lastPosY: number = 0;

        /**
         * Sync legs to boss position with animation
         * Legs in the direction of movement animate before the boss
         */
        syncLegsWithAnimation() {
            if (!this.activateSubEntities || this.subEnentities.length === 0) return;
            
            const corners: [number, number][] = [
                [this.posX, this.posY],           // top-left (0)
                [this.posX + 1, this.posY],       // top-right (1)
                [this.posX, this.posY + 1],       // bottom-left (2)
                [this.posX + 1, this.posY + 1]    // bottom-right (3)
            ];
            
            const controller = GameController.current;
            if (!controller || !controller.map) return;
            
            // Determine movement direction
            const dx = this.posX - this.lastPosX;
            const dy = this.posY - this.lastPosY;
            
            // Create array of [legIndex, delayMs] pairs
            const legAnimations: [number, number][] = [];
            
            this.subEnentities.forEach((leg: any, index: number) => {
                if (!leg || leg.destroyed) return;
                if (index < corners.length) {
                    const [x, y] = corners[index];
                    
                    // Only animate if position changed
                    if (leg.posX === x && leg.posY === y) return;
                    
                    // Calculate delay based on movement direction
                    // Legs in direction of movement animate first
                    let delay = 0;
                    
                    if (dx > 0) { // moving right
                        delay = index === 1 || index === 3 ? 0 : 250; // right legs first
                    } else if (dx < 0) { // moving left
                        delay = index === 0 || index === 2 ? 0 : 250; // left legs first
                    } else if (dy > 0) { // moving down
                        delay = index === 2 || index === 3 ? 0 : 250; // bottom legs first
                    } else if (dy < 0) { // moving up
                        delay = index === 0 || index === 1 ? 0 : 250; // top legs first
                    } else {
                        delay = 0; // no movement
                    }
                    
                    legAnimations.push([index, delay]);
                }
            });
            
            // Execute animations with staggered delays
            legAnimations.forEach(([index, delay]) => {
                setTimeout(() => {
                    const leg = this.subEnentities[index];
                    if (!leg || leg.destroyed) return;
                    
                    const [x, y] = corners[index];
                    controller.moveEntity(x, y, leg, controller.map);
                    controller.animateEntityMove(leg, x, y, 150);
                }, delay);
            });
            
            // Update last position for next movement
            this.lastPosX = this.posX;
            this.lastPosY = this.posY;
        }

        /**
         * Animate legs toward a specific target boss position and return the maximum delay used.
         * The method schedules leg `moveEntity` + `animateEntityMove` calls and returns the
         * maximum delay (in ms) after which the boss visual animation should run.
         */
        syncLegsWithAnimationTo(targetBossX: number, targetBossY: number, animDuration: number = 150): number {
            if (!this.activateSubEntities || this.subEnentities.length === 0) return 0;
            const corners: [number, number][] = [
                [targetBossX, targetBossY],
                [targetBossX + 1, targetBossY],
                [targetBossX, targetBossY + 1],
                [targetBossX + 1, targetBossY + 1]
            ];
            const controller = GameController.current;
            if (!controller || !controller.map) return 0;

            const dx = targetBossX - this.posX;
            const dy = targetBossY - this.posY;

            let maxDelay = 0;
            const legStep = 500; // ms between individual leg starts

            // Determine order: legs in movement direction first, then the others
            let order: number[] = [];
            if (dx > 0) { // right
                order = [1, 3, 0, 2];
            } else if (dx < 0) { // left
                order = [0, 2, 1, 3];
            } else if (dy > 0) { // down
                order = [2, 3, 0, 1];
            } else if (dy < 0) { // up
                order = [0, 1, 2, 3];
            } else {
                order = [0, 1, 2, 3];
            }

            let scheduled = 0;
            for (let i = 0; i < order.length; i++) {
                const index = order[i];
                const leg = this.subEnentities[index] as any;
                if (!leg || leg.destroyed) continue;
                if (index >= corners.length) continue;
                const [x, y] = corners[index];
                if (leg.posX === x && leg.posY === y) continue;

                const delay = i * legStep;
                scheduled = delay;
                setTimeout(() => {
                    controller.moveEntity(x, y, leg, controller.map);
                    controller.animateEntityMove(leg, x, y, animDuration);
                }, delay);
            }

            maxDelay = scheduled;
            return maxDelay;
        }
        
        getRandomTileInRadius(radius: number){
        const target = this.TargetCoords[0] as Player;
        if (!this.controller) return null;
        const tiles = this.controller.getTilesInSphere(target.posX,target.posY,radius);
        if (tiles.length == 0) return null;
        const randomIndex = Math.floor(Math.random() * tiles.length);
        return tiles[randomIndex];
    }


        override async RangedAttack(){
        this.controller = GameController.current;
        if (this.controller == null) {
            return
        };
        //Dual gun attack

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
        target.Health.damageLimb(targetLimb,[['GunshotWound',this.damage],['Bleeding',this.damage*5]]);
        // Add 0.5 second cooldown between shots
        await controller.delay?.(200) ?? new Promise(res => setTimeout(res,200));
        }

        //Rocket barrage

        let explosionRadius = 2;
        let missRadius = 5;
        let attackRadius = 4;

        
        for (let i=0;i<this.burst*4;i++){
            
            let miss = Math.random(); //chance to miss or hit random limb
        if (miss < this.accuracy){
            let missTile = this.getRandomTileInRadius(missRadius);
            if (missTile) {
                this.controller.createExplosion(missTile[0], missTile[1], explosionRadius, this.damage/5);
            }
        }
        else {
            let attackTile = this.getRandomTileInRadius(attackRadius);
            if (attackTile) {
                this.controller.createExplosion(attackTile[0], attackTile[1], explosionRadius, this.damage/5);
            }
           
        }
        // Add 0.2 second cooldown between shots
        await this.controller.delay?.(200) ?? new Promise(res => setTimeout(res,200));
        
        if (this.TargetCoords.length == 0) return;
       
        }
        this.stunned += 1; //boss stuns itself after attack
        }

        override onEndTurn(){
             const corners: [number, number][] = [
                [this.posX, this.posY],
                [this.posX + 1, this.posY],
                [this.posX, this.posY + 1],
                [this.posX + 1, this.posY + 1]
            ];
            const controller = GameController.current;
            if (!controller || !controller.map) return;
            if(this.activateSubEntities==true){
                // Legs already synced with animation in syncLegsWithAnimation() during movement
                this.syncLegsWithAnimation();
            }else{
            // ensure boss footprint is set and spawn 4 leg sub-entities at the corners of a 2x2 boss footprint
            this.footprintWidth = 2;
            this.footprintHeight = 2;
            const controller = GameController.current;
            if (!controller || !controller.map) return;
            this.subEnentities = [];
            
            // Initialize position tracking for movement direction detection
            this.lastPosX = this.posX;
            this.lastPosY = this.posY;
           

            for (const [x,y] of corners){
                if (!controller.map.isValidTile(x,y)) continue;
                const leg = new Boss1UnitLeg();
                leg.isSubEntity = true;
                leg.parentEntity = this as any;
                leg.ai = true;
                // place leg on tile (coexists with boss)
                controller.loadEntity(x,y,leg,controller.map);
                this.subEnentities.push(leg);
            }
            // Mark that we've activated sub-entities so next turn we move them instead of creating new ones
            this.activateSubEntities = true;
            }

        }

        override async Main(): Promise<void> {
            const controller = GameController.current;
            if (!controller) {
                await super.Main();
                return;
            }

            // Monkey-patch controller load/move functions to intercept boss moves and
            // trigger leg animations for each step. Originals will be restored after.
            const origLoad = controller.loadEntity.bind(controller);
            const origMove = controller.moveEntity.bind(controller);
            const self = this;

                controller.loadEntity = function(x: number, y: number, entity: any, map: any) {
                    // If this is the boss and has legs, sequence front legs -> boss -> back legs
                    if (entity === self && self.activateSubEntities) {
                        const animMs = 150;
                        const preBossMs = 100; // wait after front legs start before boss moves
                        const postBossMs = 100; // wait after boss moves before back legs move

                        // Determine front/back leg indices from movement direction
                        const dx = x - self.posX;
                        const dy = y - self.posY;
                        const frontIndices: number[] = [];
                        const backIndices: number[] = [];
                        // indices: 0=top-left,1=top-right,2=bottom-left,3=bottom-right
                        if (dx > 0) { // moving right => right legs front
                            frontIndices.push(1,3);
                            backIndices.push(0,2);
                        } else if (dx < 0) { // left
                            frontIndices.push(0,2);
                            backIndices.push(1,3);
                        } else if (dy > 0) { // down
                            frontIndices.push(2,3);
                            backIndices.push(0,1);
                        } else if (dy < 0) { // up
                            frontIndices.push(0,1);
                            backIndices.push(2,3);
                        } else {
                            // no movement: move all together
                            frontIndices.push(0,1,2,3);
                        }

                        const corners: [number, number][] = [
                            [x, y],
                            [x + 1, y],
                            [x, y + 1],
                            [x + 1, y + 1]
                        ];

                        // Stagger front legs one-by-one, then boss, then back legs one-by-one
                        const legStep = 50; // ms between individual leg starts

                        // Determine strict order for individual leg animation based on direction
                        let order: number[] = [];
                        if (dx > 0) { // right
                            order = [1, 3, 0, 2];
                        } else if (dx < 0) { // left
                            order = [0, 2, 1, 3];
                        } else if (dy > 0) { // down
                            order = [2, 3, 0, 1];
                        } else if (dy < 0) { // up
                            order = [0, 1, 2, 3];
                        } else {
                            order = [0, 1, 2, 3];
                        }

                        // Start visual animations for front legs in order (only those that are in frontIndices)
                        let frontCount = 0;
                        for (let i = 0; i < order.length; i++) {
                            const idx = order[i];
                            if (!frontIndices.includes(idx)) continue;
                            const leg = self.subEnentities[idx];
                            if (!leg || leg.destroyed) continue;
                            const [lx, ly] = corners[idx];
                            setTimeout(() => {
                                controller.animateEntityMove(leg, lx, ly, animMs);
                            }, frontCount * legStep);
                            frontCount++;
                        }

                        // After last front start + preBossMs, perform logical front-leg moves and boss move, then animate boss
                        const frontTotalStart = Math.max(0, frontCount - 1) * legStep;
                        const bossStart = frontTotalStart + preBossMs;
                        setTimeout(() => {
                            // logical front legs
                            for (const idx of frontIndices) {
                                const leg = self.subEnentities[idx];
                                if (!leg || leg.destroyed) continue;
                                const [lx, ly] = corners[idx];
                                origMove(lx, ly, leg, map);
                            }
                            // boss logical move
                            origLoad(x, y, entity, map);
                            controller.animateEntityMove(entity, x, y, animMs);
                        }, bossStart);

                        // After boss animation + postBossMs, move back legs one-by-one logically and animate
                        const backStartBase = bossStart + animMs + postBossMs;
                        let backIndexCounter = 0;
                        for (let i = 0; i < order.length; i++) {
                            const idx = order[i];
                            if (!backIndices.includes(idx)) continue;
                            const leg = self.subEnentities[idx];
                            if (!leg || leg.destroyed) continue;
                            const [lx, ly] = corners[idx];
                            setTimeout(() => {
                                origMove(lx, ly, leg, map);
                                controller.animateEntityMove(leg, lx, ly, animMs);
                            }, backStartBase + backIndexCounter * legStep);
                            backIndexCounter++;
                        }

                        return;
                    }

                    // default behavior for non-boss or when no sub-entities
                    origLoad(x, y, entity, map);
                } as any;

            controller.moveEntity = function(x: number, y: number, entity: any, map: any) {
                // keep logical movement and ensure legs animate if boss moves via moveEntity
                origMove(x, y, entity, map);
                if (entity === self && self.activateSubEntities) {
                    const maxDelay = self.syncLegsWithAnimationTo(x, y, 150);
                    const bossAnimDelay = Math.max(10, maxDelay + 10);
                    setTimeout(() => {
                        controller.animateEntityMove(entity, x, y, 150);
                    }, bossAnimDelay);
                }
            } as any;

            try {
                await super.Main();
            } finally {
                // restore originals
                controller.loadEntity = origLoad as any;
                controller.moveEntity = origMove as any;
            }
        }

        override async aiTurn(){
            // Run boss main AI
            await this.Main();
            // After boss finishes, let legs take their turns in order
            for (const leg of this.subEnentities.slice()){
                if (!leg || (leg as any).destroyed) continue;
                try{
                    if ((leg as BasicEnemyAI).ai){
                        await (leg as BasicEnemyAI).aiTurn();
                    }
                }catch(e){console.warn('Leg AI error',e)}
            }
        }
}

 export class Boss1AILeg extends BasicEnemyAI {
    override hostile = true;
    override meleePreference = true;
    override energy = 1;
    override sightRange = 20;
    override attackRange = 1;
    override damage = 20;
    override accuracy = 0; //chance to miss
    override stationary = true;
    override isSubEntity = true;

    // Boss leg has a powerful melee attack that always hits, but does not move or do ranged attacks, the leg can get on the same tile as player stunning them for 1 turn and dealing heavy damage, but the leg itself can be targeted and damaged by the player, if the leg's health reaches 0 it gets destroyed and removed from the boss's subentities, each destroyed leg reduces the boss energry by 2.

    override MeleeAttack(){
        const controller = GameController.current;
        if (!controller) return;
        if (this.TargetCoords.length == 0) return;
        const target = this.TargetCoords[0] as Player;
        let damageDealt = this.damage;
        target.Health.damageLimb("torso",[['Fracture',damageDealt]]);
        target.Health.torso.zapped.increaseSeverity(50);
    }

    override onDestroyed(damage: number, damageType: string){
        // notify parent boss and remove self from its sub-entity list
        if (this.parentEntity && (this.parentEntity as any).subEnentities){
            const parent = this.parentEntity as any;
            parent.subEnentities = parent.subEnentities.filter((s: any) => s !== this);
            // reduce boss energy as penalty
            if (parent.energy && typeof parent.energy === 'number'){
                parent.energy = Math.max(0, parent.energy - 2);
            }
        }
        // remove from map
        GameController.current?.removeEntities(this.posX, this.posY, this.id);
    }
   
 }