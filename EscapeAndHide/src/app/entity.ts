export abstract class Entity{

    name: string = "";
    sprite: string = "placeholder.png";
    posX: number = 0;
    posY: number = 0;
    collidable: boolean = false;
    damageable: boolean = false;
    health: number | null = null;

    constructor(name: string, sprite: string, PosX: number, PosY: number, collidable: boolean, damageable: boolean, health: number) {
        this.name = name;
        this.sprite = "placeholder.png";
        this.posX = PosX;
        this.posY = PosY;
        this.collidable = collidable
        this.damageable = damageable
        this.health = health;
    }

    takeDamage(damage:number, damageType: string){
        if (this.damageable==true){
            this.health! -= damage;
            if (this.health!<=0){
                this.destroy()
            }
        }
    }

    destroy(){

    }
    
}