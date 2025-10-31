import * as PIXI from 'pixi.js';
import { entity } from './entity';
import { Item } from './inventory/item';
export class tile {

    name: string | null;
    hasCollision: boolean;
    effect?: string;
    destroyable: boolean;
    health: number | null;
    flammable: boolean;
    fireValue: number;
    brokenTile: String | null;
    sprite: String;
    entity: entity | null; //placeholder for entity object

     constructor(name: string|null, hasCollision: boolean, effect: string, destroyable: boolean, health: number|null, flammable: boolean, fireValue: number, brokenTile: String|null, sprite: String, entity: entity|null){
        this.name = name
        this.hasCollision = hasCollision
        this.effect = effect
        this.destroyable = destroyable
        this.health = health
        this.flammable = flammable
        this.fireValue = fireValue
        this.brokenTile = brokenTile
        this.sprite = sprite
        this.entity = entity
    }
}
