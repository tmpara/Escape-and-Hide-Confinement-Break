import { entity } from './entity';

export class Dummy extends entity {
  PosX: number;
  PosY: number;
  renderX: number;
  renderY: number;
  id: string;
  health: number;

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
