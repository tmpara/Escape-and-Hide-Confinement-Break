export class Item {
  name: string;
  category: string;
  displayed: boolean;
  sprite: String;

  constructor(name: string, category: string, displayed: boolean, sprite: String) {
    this.name = name;
    this.displayed = displayed;
    this.category = category;
    this.sprite = sprite;
  }
}
