import { entity } from './entity';
import { Item } from './items/item';
export class tile {

    name: string | null = "empty";
    hasCollision: boolean = false;
    effect?: string = "";
    destroyable: boolean = false;
    health: number | null = null;
    flammable: boolean = false;
    brokenTile: String | null = null;
    sprite: String = "placeholder.png";
    hiddenOutsideLOS: boolean = false;
    fireValue: number = 0;
    hasItem: boolean = false;
    item: Item | null = null;
    entity: entity | null = null;

    constructor(name: string|null, hasCollision: boolean, effect: string, destroyable: boolean, health: number|null, flammable: boolean, brokenTile: String|null, sprite: String, hiddenOutsideLOS: boolean, fireValue: number, hasItem: boolean, item: Item | null, entity: entity|null){
        this.name = name
        this.hasCollision = hasCollision
        this.effect = effect
        this.destroyable = destroyable
        this.health = health
        this.flammable = flammable
        this.brokenTile = brokenTile
        this.sprite = sprite
        this.hiddenOutsideLOS = hiddenOutsideLOS
        this.fireValue = fireValue
        this.hasItem = hasItem;
        this.item = item;
        this.entity = entity
    }
}
