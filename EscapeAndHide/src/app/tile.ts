import * as PIXI from 'pixi.js';
import { entity } from './entity';
import { Item } from './inventory/item';
export class tile {
  hasCollision: boolean;
  effect?: string;
  hasItem: boolean;
  item: Item | null;
  destroyable: boolean;
  flammable: boolean;
  health: number | null;
  sprite: String;
  entity: entity | null; //placeholder for entity object

  constructor(hasCollision: boolean, effect: string, hasItem: boolean, item: Item|null, destroyable: boolean, health: number|null, flammable: boolean, sprite: String, entity: entity|null){
    this.hasCollision = hasCollision
    this.effect = effect
    this.hasItem = hasItem
    this.item = item
    this.destroyable = destroyable
    this.health = health
    this.flammable = flammable
    this.sprite = sprite
    this.entity = entity
  }
}
