import { Item } from "./item";

export class Armor extends Item {
  defense: number;
  slot: string;
  constructor(
      name: string,
      category: string,
      displayed: boolean,
      sprite: string,
      equippedSprite: string|null,
      defense: number,
      slot: string
  ) {
      super(name, category, displayed, sprite, equippedSprite);
      this.defense = defense;
      this.slot = slot;
  }
}