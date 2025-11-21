export abstract class Entity{

    name = "";
    sprite = "placeholder.png";
    posX = 0;
    posY = 0;
    collidable = false;
    damageable = false;
    health: number | null = null;
    hiddenOutsideLOS = false
    blockLOS = false;

    takeDamage(damage:number, damageType: string){
        // this.takeDamageCustom(damage,damageType)
        if (this.damageable==true){
            this.health! -= damage;
            if (this.health!<=0){
                this.destroy()
            }
        }
    }

    // abstract takeDamageCustom(damage:number, damageType:string): void

    destroy(){
        // this.destroyCustom()
    }

    // abstract destroyCustom(): void
    
}