import * as PIXI from 'pixi.js';
import { entity } from "./entity";
export class tile {

    hasCollision: boolean;
    effect?: string;
    destroyable: boolean;
    health: number | null;
    sprite: String;
    entity: entity | null; //placeholder for entity object

     constructor(hasCollision: boolean, effect: string, destroyable: boolean, health: number|null, sprite: String, entity: entity|null){
        this.hasCollision = hasCollision
        this.effect = effect
        this.destroyable = destroyable
        this.health = health
        this.sprite = sprite
        this.entity = entity
    }
}