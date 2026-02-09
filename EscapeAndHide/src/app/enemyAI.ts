import { Entity } from "./entity";
import { GameController } from "./game.controller";
import { Player } from "./player";
import { LimbName } from "./health/health";
import { setPositions } from "pixi.js";

export class BasicEnemyAI extends Entity{
    
    meleePreference = false;
    rangedOnly = false;
    patrolWhenIdle = true;
    maxEnergy = 5;
    sightRange = 8;
    attackRange = 3;
    optimalRange = 2;
    //values below should probably be removed/changed later
    damage = 1;
    accuracy = 0.1; //chance to miss
    stunned = 0;
    //these values shouldn't be changed
    parentEntity: Entity | null = null;
    alerted = false;
    hostile = false;
    energy = this.maxEnergy
    Targets: Entity[] = [];
    LastKnownTargetCoords: [number, number] | null = null;

    //TO DO: FIX ENEMY TURN GETTING STUCK AFTER ATTACKING

    async aiTurn(){
        await this.Main();
    }
    
       async Main(): Promise<void> {

        // find a position at the start of the turn
        const patrolPos = this.findRandomPatrolPos();

        while(this.energy > 0){
        
            if (this.stunned > 0){
                this.stunned -= 1;
                this.energy = 0;
                if (this.stunned < 0){
                    this.stunned = 0;
                }
            }

            if (!GameController.current) return;
            // update target list
            this.findTargets();

            const controller = GameController.current;

            if (this.alerted && this.Targets.length > 0) {
                // Has current targets: pursue and attack as before
                const target = this.Targets[0] as Player;

                const dx = Math.abs(this.posX - target.posX);
                const dy = Math.abs(this.posY - target.posY);
                const distanceToTarget = Math.ceil(Math.max(dx, dy) + 0.5 * Math.min(dx, dy));
                
                // If too close for ranged attack, move away
                if (this.meleePreference == false && distanceToTarget < this.optimalRange) {
                    // For ranged enemies, if player is too close, move away to optimal range
                    const dx = this.posX - target.posX;
                    const dy = this.posY - target.posY;
                    const nx = this.posX + (dx > 0 ? 1 : dx < 0 ? -1 : 0);
                    const ny = this.posY + (dy > 0 ? 1 : dy < 0 ? -1 : 0);
                    
                    this.moveToPosition(nx,ny)
                }

                // If in ranged attack window -> ranged attack
                if (distanceToTarget <= this.attackRange && distanceToTarget >= this.optimalRange && this.meleePreference == false) {
                    this.energy -= 1;
                    this.RangedAttack();
                    controller.drawGrid?.();
                    controller.drawPlayer?.();
                }
            
                // If adjacent -> melee
                if (distanceToTarget === 1 ) {
                    if (this.rangedOnly == true){
                        // For non-melee enemies, if player is too close, move away to attack range
                        const dx = this.posX - target.posX;
                        const dy = this.posY - target.posY;
                        const nx = this.posX + (dx > 0 ? 1 : dx < 0 ? -1 : 0);
                        const ny = this.posY + (dy > 0 ? 1 : dy < 0 ? -1 : 0);
                        this.moveToPosition(nx,ny)
                    }else{
                        this.energy -= 1;
                        this.MeleeAttack();
                    }
                    
                    controller.drawGrid?.();
                    controller.drawPlayer?.();
                }

                this.moveToPosition(this.Targets[0].posX,this.Targets[0].posY)

            } else if (this.LastKnownTargetCoords) {
                this.moveToPosition(this.LastKnownTargetCoords[0],this.LastKnownTargetCoords[1])
                if(this.posX==this.LastKnownTargetCoords[0] && this.posY == this.LastKnownTargetCoords[1]){
                    this.LastKnownTargetCoords = null
                }
            }else if(this.patrolWhenIdle){
                if(patrolPos != null){
                    await this.moveToPosition(patrolPos![0], patrolPos![1]);
                    if(this.posX==patrolPos![0] && this.posY == patrolPos![1]){
                        this.energy = 0;
                    }
                }else{
                    this.energy=0;
                }
            }
            await (controller.delay?.(500) ?? new Promise(res => setTimeout(res,250)));
        }
        this.energy = this.maxEnergy;
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
                        if (!this.Targets.includes(entities![i])){
                            this.Targets.push(entities![i]);
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
                this.Targets = [];
                // do not clear LastKnownTargetCoords here
            }
    }

    findRandomPatrolPos(){

        const controller = GameController.current;
        if (!controller) return null;

        let positionFound = false;

        while(positionFound==false){
            const randomX = this.posX + Math.floor(Math.random() * 7) - 3;
            const randomY = this.posY + Math.floor(Math.random() * 7) - 3;

            if (controller.map && controller.map.isValidTile(randomX, randomY) && controller.isTileWalkable(randomX, randomY)) {
                positionFound = true;
                return [randomX, randomY];
            }
        }
        return null;
    }

    async moveToPosition(targetX: number, targetY: number){
        const controller = GameController.current;
        const path = controller!.findPathAStar(this.posX, this.posY, targetX, targetY);
        if (!path || path.length <= 1) {
            return;
        }

        // move up to `energy` steps along the path
        const steps = 1; //maybe will be changed later
        for (let step = 1; step <= steps; step++) {
            const [nx, ny] = path[step];

            // safety checks: bounds and walkability
            if (!controller!.map || !controller!.map.isValidTile(nx, ny)) return;

            // if there's a door on the next tile, try to open it
            const door = controller!.getDoorOnTile(nx, ny);
            if (door) {    
                if (typeof door.onUse === "function") {
                    if(door.open == false){
                        door.onUse();
                        this.energy -= 1;
                    }
                }
                controller!.drawGrid?.();
                controller!.drawPlayer?.();
            }

            if (!controller!.isTileWalkable(nx, ny)) return;

            this.removeEntity(this.posX, this.posY);
            controller!.loadEntity(nx, ny, this, controller!.map);

            // redraw and pause
            controller!.drawGrid?.();
            controller!.drawPlayer?.();

            if (nx === targetX && ny === targetY) {
                return;
            }
        }
        this.energy -= 1;
        return;
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
        if (this.Targets.length == 0) return;
        const target = this.Targets[0] as Player;
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
        if (this.Targets.length == 0) return;
        const target = this.Targets[0] as Player;
        let damageDealt = this.damage*2;
        target.Health.damageLimb(targetLimb,[['Lacerations',damageDealt],]);
        
    }

}

export class LightInterferanceUnitAI extends BasicEnemyAI {
    override hostile = true;
    override meleePreference = false;
    override maxEnergy = 4;
    override sightRange = 8;
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
        if (this.Targets.length == 0) return;
        const target = this.Targets[0] as Player;
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
        if (this.Targets.length == 0) return;
        const target = this.Targets[0] as Player;
        let damageDealt = this.damage*2;
        target.Health.damageLimb(targetLimb,[['Lacerations',damageDealt*2],['Bleeding',damageDealt*2]]);
        target.Health.torso.zapped.increaseSeverity(damageDealt*5);
    }
}

export class MediumInterferanceUnitAI extends BasicEnemyAI {
    override hostile = true;
    override meleePreference = false;
    override maxEnergy = 3;
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
        if (this.Targets.length == 0) return;
        const target = this.Targets[0] as Player;
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
        if (this.Targets.length == 0) return;
        const target = this.Targets[0] as Player;
        let damageDealt = 10;
        target.Health.damageLimb(targetLimb,[['Lacerations',damageDealt*2],['Bleeding',damageDealt*5]]);
  
    }
}

export class HeavyInterferanceUnitAI extends BasicEnemyAI {
    override hostile = true;
    override meleePreference = false;
    override maxEnergy = 2;
    override sightRange = 6
    override attackRange = 5;
    override optimalRange = this.attackRange-2;
    override damage = 10
    override accuracy = 0.6; //chance to miss
    burst = 4; //number of shots in a burst
    controller = GameController.current;
    

    getRandomTileInRadius(radius: number){
        const target = this.Targets[0] as Player;
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
        
        if (this.Targets.length == 0) return;
       
        }
        this.stunned += 1; //heavy unit stuns itself after attack
    }
}

export class OppressorUnitAI extends BasicEnemyAI {
    override hostile = true;
    override meleePreference = true;
    override maxEnergy = 7;
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
        if (this.Targets.length == 0) return;
        const target = this.Targets[0] as Player;
        
        target.Health.damageLimb(targetLimb,[['Fracture',damageDealt]]);
        if (stunChance < 0.3){
            target.Health.torso.zapped.increaseSeverity(20);//change to stun affliction later
        }
  
    }
}

export class TrapperUnitAI extends BasicEnemyAI {
    override hostile = false;
    override meleePreference = false;
    override maxEnergy = 5;
    override sightRange = 3;
    override attackRange = 2;
    override damage = 1;
    override accuracy = 0.1; //chance to miss
}

 export class ScorcherUnitAI extends BasicEnemyAI {
    override hostile = true;
    override meleePreference = false
    override rangedOnly = true;
    override maxEnergy = 5;
    override sightRange = 5;
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
        if (!controller || this.Targets.length === 0) return;
        const target = this.Targets[0] as Player;
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
                controller.ignite(x, y, (50 - tileRange*15), true, true); 
            }
            
            for (const entity of entities) {
                if (entity instanceof Player) {
                    // Damage player, perhaps with fire damage
                    // For now, use existing damage logic
                }
            }
        }
        
        //this.stunned += 1; //scorcher stuns itself after attack
        console.log("Scorcher used Ranged Attack and is stunned for "+ this.stunned+" turn.");
    }

 }