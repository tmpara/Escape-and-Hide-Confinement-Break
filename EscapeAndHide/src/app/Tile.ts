export class Tile {
    hasCollision: boolean;
    effect?: string;
    destroyable: boolean;
    health: number;
    contains?: string; //placeholder for object


    constructor(hasCollision: boolean, effect: string, destroyable: boolean, health: number, contains: string){
        this.hasCollision = hasCollision
        this.effect = effect
        this.destroyable = destroyable
        this.health = health
        this.contains = contains
    }
}