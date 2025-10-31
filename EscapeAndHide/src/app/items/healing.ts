import { Item } from './item';

export class Healing extends Item {
  constructor(
    name: string,
    category: string,
    displayed: boolean,
    sprite: string,
    public bleedingHeal: number
  ) {
    super(name, category, displayed, sprite);
  }
}
