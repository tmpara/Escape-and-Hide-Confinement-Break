import { Entity } from './entity';
import { Item } from './items/item';
export class tile {

    name: string | null = "empty";
    sprite: String = "placeholder.png";
    flammable: boolean = false;
    fireValue: number = 0;
    item: Item | null = null;
    entity: Entity | null = null;

    constructor(name: string|null, sprite: String, flammable: boolean, fireValue: number, item: Item | null, entity: Entity|null){
        this.name = name
        this.sprite = sprite
        this.flammable = flammable
        this.fireValue = fireValue
        this.item = item;
        this.entity = entity
    }
}
