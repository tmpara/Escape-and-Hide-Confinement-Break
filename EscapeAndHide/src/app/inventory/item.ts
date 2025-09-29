export class Item {
  name: string;
  category: string;
  displayed: boolean;

  constructor(name: string, category: string, displayed: boolean) {
    this.name = name;
    this.displayed = displayed;
    this.category = category;
  }
}
