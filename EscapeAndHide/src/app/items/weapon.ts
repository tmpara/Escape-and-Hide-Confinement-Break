import { Item } from './item';

export class Weapon extends Item {
  damage: number;
  range: number;
  constructor(
    name: string,
    category: string,
    displayed: boolean,
    sprite: string,
    damage: number,
    range: number
  ) {
    super(name, category, displayed, sprite);
    this.damage = damage;
    this.range = range;
  }
}
