import { entity } from './entity';
import { Item } from './items/item';
import { Items } from './items/items';

export class Dummy extends entity {
  displayName: string = "Dummy"
  PosX: number;
  PosY: number;
  renderX: number;
  renderY: number;
  id: string;
  health: number;
  isDead: boolean = false;
  lootTable: Item[] = [new Items().gun, new Items().bandage];

  constructor(PosX: number, PosY: number, id: string, health: number) {
    super();
    this.id = id;
    this.PosX = PosX;
    this.PosY = PosY;
    this.renderX = PosX;
    this.renderY = PosY;
    this.health = health;
  }

  dealDamage(damage: number){
    if(!this.isDead){
      this.health -= damage;
    }
  }
}

export class HeavyDummy extends entity {
  displayName: string = "Heavy Dummy";
  PosX: number;
  PosY: number;
  renderX: number;
  renderY: number;
  id: string;
  health: number;
  isDead: boolean = false;
  lootTable: Item[] = [new Items().bigGun, new Items().medkit];

  constructor(PosX: number, PosY: number, id: string, health: number) {
    super();
    this.id = id;
    this.PosX = PosX;
    this.PosY = PosY;
    this.renderX = PosX;
    this.renderY = PosY;
    this.health = health;
  }
}