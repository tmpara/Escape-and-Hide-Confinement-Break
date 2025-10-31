export class Item {
  name: string;
  category: string;
  displayed: boolean;
  sprite: string;

  constructor(
    name: string,
    category: string,
    displayed: boolean,
    sprite: string
  ) {
    this.name = name;
    this.displayed = displayed;
    this.category = category;
    this.sprite = sprite;
  }
}
