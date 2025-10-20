import * as PIXI from 'pixi.js';
import { entity } from './entity';

export class Player extends entity {
  PosX: number;
  PosY: number;
  id: string;

  constructor(PosX: number, PosY: number, id: string) {
    super();
    this.id = id;
    this.PosX = PosX;
    this.PosY = PosY;
  }
}
