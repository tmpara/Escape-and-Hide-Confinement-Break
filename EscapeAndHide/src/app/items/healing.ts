import { Item } from './item';

export class Healing extends Item {
  bleedingHeal: number;
  constructor(
    name: string,
    category: string,
    displayed: boolean,
    sprite: string,
    equippedSprite: string|null,
    bleedingHeal: number
  ) {
    super(name, category, displayed, sprite, equippedSprite);
    this.bleedingHeal = bleedingHeal;
  }
}
