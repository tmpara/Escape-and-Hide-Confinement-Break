import { Entity } from './entity';
import { GameController } from './game.controller';

export class Wall1 extends Entity {
  override name = "wall";
  override sprite = "placeholder.png";
  override posX = 0;
  override posY = 0;
  override collidable = true;
  override damageable = true;
  override health = 500;
  override hiddenOutsideLOS = false;
  override blockLOS = true;
  override flammable = false;

  takeDamageCustom(){}
  destroyCustom(){}
  onUse(){}
  onEndTurn(){}
  onHeal(){}

}

export class WallCorner1 extends Entity {
  override name = "wall";
  override sprite = "placeholder.png";
  override posX = 0;
  override posY = 0;
  override collidable = true;
  override damageable = false;
  override health = 0;
  override hiddenOutsideLOS = false;
  override blockLOS = true;
  override flammable = false;

  takeDamageCustom(){}
  destroyCustom(){}
  onUse(){}
  onEndTurn(){}
  onHeal(){}
  
}

export class ExplosiveBarrel extends Entity {
  override name = "Explosive Barrel";
  override sprite = "explosiveBarrel.png";
  override posX = 0;
  override posY = 0;
  override collidable = true;
  override damageable = true;
  override health = 50;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = false;

  takeDamageCustom(){
    GameController.current?.ignite(this.posX,this.posY,100,true,true);
  }

  destroyCustom(){
    GameController.current?.createExplosion(this.posX,this.posY,3,200,true);
  }

  onUse(){}
  onEndTurn(){}
  onHeal(){}
  
}

