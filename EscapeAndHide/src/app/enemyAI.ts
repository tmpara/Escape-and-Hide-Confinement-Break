import { range } from "rxjs";
import { Entity } from "./entity";
import { GameController } from "./game.controller";
import { Player } from "./player";
export class BasicEnemyAI extends Entity{
    parentEntity: Entity | null = null;
    alerted = false;
    hostile = false;
    meleePreference = false;
    TargetCoords: Entity[] = [];
    LastKnownTargetCoords: [number, number] | null = null;
    energy = 3;
    sightRange = 30;
    attackRange = 3;
    damage = 0;


       async Main(): Promise<void> {
        
        if (!GameController.current) return;
        // update target list
        this.findTargets();
        if (!this.alerted) return;

        const target = this.TargetCoords[0] as Player | undefined;
        if (!target) return;

        const distanceToTarget = Math.max(Math.abs(this.posX - target.posX), Math.abs(this.posY - target.posY));

        // If in ranged attack window (but not adjacent) -> ranged attack
        if (distanceToTarget <= this.attackRange && distanceToTarget > 1) {
            this.RangedAttack();
           // show action
           if (GameController.current) {
            GameController.current.drawGrid?.();
            GameController.current.drawPlayer?.();
            await (GameController.current.delay?.(160) ?? new Promise(res => setTimeout(res,160)));
          }
            return;
        }

        // If adjacent -> melee
        if (distanceToTarget === 1) {
            this.MeleeAttack();
           if (GameController.current) {
            GameController.current.drawGrid?.();
             GameController.current.drawPlayer?.();
            await (GameController.current.delay?.(160) ?? new Promise(res => setTimeout(res,160)));
          }
            return;
        }

        // Otherwise: path towards the player using A* and spend movement (energy)
        const controller = GameController.current;
        if (!controller) return;
        const path = controller.findPathAStar(this.posX, this.posY, target.posX, target.posY);
        if (!path || path.length <= 1) return; // no movement possible

        // move up to `energy` steps along the path (path[0] == start)
        const steps = Math.min(this.energy, path.length - 1);

        const pauseMs = (controller as any).enemyStepDelay ?? 160;
        for (let step = 1; step <= steps; step++) {
            const [nx, ny] = path[step];

            // safety checks: bounds and walkability
            if (!controller.map || !controller.map.isValidTile(nx, ny)) break;

            // if there's a door on the next tile and it's closed, try to open it and stop moving this turn
            const door = controller.getDoorOnTile(nx, ny);

            if (door) {
                // attempt to open via common method names, fall back to toggling flags
                if (typeof door.onUse === "function") {
                    door.onUse();
                } else if (typeof door.open === "function") {
                    door.open();
                } else if ('isOpen' in door) {
                    (door as any).isOpen = true;
                } else {
                    (door as any).isOpen = true;
                }
                // redraw + pause so player sees the open attempt, then stop movement this turn
                controller.drawGrid?.();
                controller.drawPlayer?.();
                await (controller.delay?.(pauseMs) ?? new Promise(res => setTimeout(res,pauseMs)));
                break;
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
           // if (GameController.current?.isLOSObstructed(this.posX,this.posY,tile[0],tile[1],true,true)==false){
                entities = GameController.current?.getAllEntitiesOnTile(tile[0],tile[1])
                allEntities = allEntities?.concat(entities) ;
                  for (let i=0;i<entities!.length;i++){
                    if (entities![i] instanceof Player){
                        this.alerted=true;
                        if (!this.TargetCoords.includes(entities![i])){
                            this.TargetCoords.push(entities![i]);
                        }
                        
                    }
                }
            //}
            
            });
            for (let i=0;i<allEntities.length;i++){
                if (allEntities[i] instanceof Player){
                    temp = 1;
                }
            }
            if (temp==0){
                this.alerted=false;
                this.TargetCoords = [];
            }
    }
    RangedAttack(){

    }

    MeleeAttack(){

    }

}

export class liuAI extends BasicEnemyAI {
    override hostile = true;
    override meleePreference = false;
    override energy = 3;
    override sightRange = 7;
    override attackRange = 5;
    override damage = 10;


}