import { entity } from './entity';
import { Item } from './inventory/item';

export class Tile {
  hasCollision: boolean;
  hasItem: boolean;
  item: Item | null;
  effect?: string;
  destroyable: boolean;
  health: number | null;
  entity: entity | null; //placeholder for entity object

  constructor(
    hasCollision: boolean,
    hasItem: boolean,
    item: Item | null,
    effect: string,
    destroyable: boolean,
    health: number | null,
    entity: entity | null
  ) {
    this.hasCollision = hasCollision;
    this.hasItem = hasItem;
    this.item = item;
    this.effect = effect;
    this.destroyable = destroyable;
    this.health = health;
    this.entity = entity;
  }
}
