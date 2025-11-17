import { Entity } from './entity';
import { Item } from './items/item';
import { Items } from './items/items';

export type dummyConfig = {
  name?: string,
  sprite?: string,
  posX: number,
  posY: number,
  renderX?: number,
  renderY?: number,
  collidable?: boolean,
  damageable?: boolean,
  health?: number,
}

export class Dummy extends Entity {
  renderX: number;
  renderY: number;
  isDead: boolean = false;
  lootTable: Item[] = [new Items().gun, new Items().bandage];
  constructor(t:dummyConfig) 
    {
      const {name
        ,sprite
        ,posX
        ,posY
        ,collidable
        ,damageable
        ,health}=t
      super(name ?? "Dummy", sprite ?? "dummy.png", posX ?? 0, posY ?? 0, collidable ?? false, damageable ?? false, health ?? 100);
      this.renderX = 0;
      this.renderY = 0;
    }
}

export type heavyDummyConfig = {
  name?: string,
  sprite?: string,
  posX: number,
  posY: number,
  renderX?: number,
  renderY?: number,
  collidable?: boolean,
  damageable?: boolean,
  health?: number,
}

export class HeavyDummy extends Entity {
  renderX: number;
  renderY: number;
  isDead: boolean = false;
  lootTable: Item[] = [new Items().gun, new Items().bandage];
  constructor(t:heavyDummyConfig) 
    {
      const {name
        ,sprite
        ,posX
        ,posY
        ,collidable
        ,damageable
        ,health}=t
      super(name ?? "Heavy Dummy", sprite ?? "heavyDummy.png", posX ?? 0, posY ?? 0, collidable ?? false, damageable ?? false, health ?? 100);
      this.renderX = 0;
      this.renderY = 0;
    }
}