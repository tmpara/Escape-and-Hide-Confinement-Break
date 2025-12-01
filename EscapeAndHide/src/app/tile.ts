import { Entity } from './entity';
import { Item } from './items/item';
export class tile {

    name: string | null = "empty";
    sprite: string = "placeholder.png";
    effect: string = ""
    flammable: boolean = false;
    fireValue: number = 0;
    item: Item | null = null;
    entity: Entity[];

    constructor(name: string|null, sprite: string, effect: string, flammable: boolean, fireValue: number, item: Item | null, entity: Entity[]){
        this.name = name
        this.sprite = sprite
        this.effect = effect
        this.flammable = flammable
        this.fireValue = fireValue
        this.item = item;
        this.entity = entity
    }
}
