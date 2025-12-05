import { range } from "rxjs";
import { Entity } from "./entity";
import { GameController } from "./game.controller";
import { Player } from "./player";
export class BasicEnemyAI extends Entity{
    parentEntity: Entity | null = null;
    alerted = false;
    hostile = false;
    meleePreference = false;
    TargetCoords: {x:number,y:number}[] = [];
    energy = 3;
    sightRange = 7;
    attackRange = 3;
    damage = 0;

    Main(){
        console.log("AI TURN")
        if (this.alerted==false){
        this.findTargets();
          console.log("looking for targets")
        }
        else{
            for(let i=this.energy;i<=0;i--){
                this.findTargets();
                    if (this.TargetCoords.length>0 && this.energy>0){
                let target = this.TargetCoords[0];
                let distanceToTarget = Math.max(Math.abs(this.posX - target.x),Math.abs(this.posY - target.y))
                if (distanceToTarget<=this.attackRange && distanceToTarget>1){
                    this.RangedAttack();       
                    console.log("he attac ranged")   
                }
                else if  (distanceToTarget>this.attackRange){
                    //move towards target
                    this.removeEntity(this.posX,this.posY);
                    this.posX += 1
                    GameController.current?.loadEntity(this.posX,this.posY,this,GameController.current?.map);
                    

                    
                }
                else if (distanceToTarget==1){
                    this.MeleeAttack();
                    console.log("he attac melee") 
                }
                
                }

            }
       
            }
    
    }

    removeEntity(x: number, y: number) {
    let entities = GameController.current?.getAllEntitiesOnTile(x,y)
    for(let i=0;i<entities!.length;i++){
      if (entities![i] instanceof BasicEnemyAI){
        entities!.splice(i)
      }
    }
  }

    findTargets(){
        let tiles = GameController.current?.getTilesInSphere(this.posX,this.posY,this.sightRange)!
            tiles.forEach((tile) => {
            if (GameController.current?.isLOSObstructed(this.posX,this.posY,tile[0],tile[1],true,true)==false){
                  let entities = GameController.current?.getAllEntitiesOnTile(tile[0],tile[1])
                  for (let i=0;i<entities!.length;i++){
                    if (entities![i] instanceof Player){
                        this.alerted=true;
                        this.TargetCoords.push({x:tile[0],y:tile[1]})
                    }
                }
            }
            });
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