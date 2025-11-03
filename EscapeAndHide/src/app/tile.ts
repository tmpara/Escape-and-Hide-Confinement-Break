import { entity } from './entity';
import { Item } from './items/item';
export class tile {

    name: string | null;
    hasCollision: boolean;
    effect?: string;
    destroyable: boolean;
    health: number | null;
    flammable: boolean;
    brokenTile: String | null;
    sprite: String;
    fireValue: number;
    hasItem: boolean;
    item: Item | null;
    entity: entity | null;

     constructor(name: string|null, hasCollision: boolean, effect: string, destroyable: boolean, health: number|null, flammable: boolean, brokenTile: String|null, sprite: String, fireValue: number, hasItem: boolean, item: Item | null, entity: entity|null){
        this.name = name
        this.hasCollision = hasCollision
        this.effect = effect
        this.destroyable = destroyable
        this.health = health
        this.flammable = flammable
        this.brokenTile = brokenTile
        this.sprite = sprite
        this.fireValue = fireValue
        this.hasItem = hasItem;
        this.item = item;
        this.entity = entity
    }
}
