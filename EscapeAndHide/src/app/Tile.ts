import { entity } from "./entity";

export class Tile {
    hasCollision: boolean;
    effect?: string;
    destroyable: boolean;
    health: number | null;
    entity: entity | null; //placeholder for entity object


     constructor(hasCollision: boolean, effect: string, destroyable: boolean, health: number|null, entity: entity|null){
        this.hasCollision = hasCollision
        this.effect = effect
        this.destroyable = destroyable
        this.health = health
        this.entity = entity
    }
}