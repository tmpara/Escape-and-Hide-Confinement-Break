export class Item {
  name: string;
  category: string;
  displayed: boolean;
  sprite: string;
  equippedSprite: string|null;

  constructor(
    name: string,
    category: string,
    displayed: boolean,
    sprite: string,
    equippedSprite: string|null
  ) {
    this.name = name;
    this.displayed = displayed;
    this.category = category;
    this.sprite = sprite;
    this.equippedSprite = equippedSprite;
  }
}
