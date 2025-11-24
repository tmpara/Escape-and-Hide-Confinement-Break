import { GameController } from './game.controller';
export abstract class Entity{

    name = "";
    sprite = "placeholder.png";
    posX = 0;
    posY = 0;
    collidable = false;
    damageable = false;
    health = 0;
    hiddenOutsideLOS = false
    blockLOS = false;
    flammable = false;

    maxHealth = this.health
    destroyed = false;
    fireValue = 0;

    takeDamage(damage:number, damageType: string){
        this.takeDamageCustom(damage,damageType)
        if (this.damageable==true && this.destroyed==false){
            this.health -= damage;
            if (this.health!<=0){
                this.destroy(damage,damageType)
            }
        }
    }

    heal(amount:number){
        this.onHeal();
        if (this.damageable==true && this.destroyed==false){
            this.health += amount;
            if(this.health>this.maxHealth){
                this.health=this.maxHealth
            }
        }
    }

    destroy(damage:number, damageType: string){
        if (this.destroyed==false ){
            this.destroyed=true;
            this.destroyCustom()
            GameController.current?.RemoveEntities(this.posX, this.posY);
        }
    }

    abstract takeDamageCustom(damage:number, damageType:string): void

    abstract destroyCustom(): void

    abstract onUse(): void

    abstract onEndTurn(): void

    abstract onHeal(): void
    
}