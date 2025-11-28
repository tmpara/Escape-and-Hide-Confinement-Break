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

export class Door extends Entity {
  override name = "door";
  override sprite = "door_closed.png";
  override posX = 0;
  override posY = 0;
  override zIndex = 9;
  override collidable = true;
  override damageable = true;
  override health = 400;
  override hiddenOutsideLOS = false;
  override blockLOS = true;
  override flammable = false;

  open=false;
  blocked=false;

  onUse(){
    if (this.open == false){
      this.open = true;
      this.sprite = "door_open.png";
      this.collidable = false;
      this.blockLOS = false;
    }else{
      let entities = GameController.current?.getAllEntitiesOnTile(this.posX,this.posY)!
      for(let i=0;i<entities.length!;i++){
        if (entities[i] instanceof Door == false){
          this.blocked=true
        }else{
          this.blocked=false
        }
      }
      if(this.blocked==false){
        this.open = false;
        this.sprite = "door_closed.png";
        this.collidable = true;
        this.blockLOS = true;
      }
    }
  }

  takeDamageCustom(){}
  destroyCustom(){}
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

