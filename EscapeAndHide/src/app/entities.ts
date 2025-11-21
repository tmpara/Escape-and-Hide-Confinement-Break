import { Entity } from './entity';


export class Wall1 extends Entity {
  override name = "wall";
  override sprite = "placeholder.png";
  override posX = 0;
  override posY = 0;
  override collidable = true;
  override damageable = true;
  override health = 100;
  override hiddenOutsideLOS = false;
  override blockLOS = true;
}

// export class ExplosiveBarrel extends Entity {
//   override name = "dummy";
//   override sprite = "dummy.png";
//   override posX = 0;
//   override posY = 0;
//   override collidable = true;
//   override damageable = true;
//   override health = 100;
//   override hiddenOutsideLOS = true;
//   override blockLOS = false;
// }
