import { GameController } from './game.controller';
export abstract class Entity {
  
  id=0;
  name = "";
  description = "";
  sprite = "placeholder.png";
  deadSprite = "";
  tags: string[] | null = null;
  connectsWith: string | null = null
  spriteTopCap = "";
  spriteBottomCap = "";
  spriteLeftCap = "";
  spriteRightCap = "";
  spriteTopLeftCorner = "";
  spriteTopRightCorner = "";
  spriteBottomLeftCorner = "";
  spriteBottomRightCorner = "";
  posX = 0;
  posY = 0;
  zIndex = 4;
  collidable = false;
  damageable = false;
  health = 0;
  maxHealth = this.health;
  hiddenOutsideLOS = false;
  blockLOS = false;
  flammable = false;
  lootable = false
  ai=false;
  destroyed = false;
  removeOnDestroy = true;
  fireValue = 0;

  takeDamage(damage:number, damageType: string){
    this.onTakeDamage(damage,damageType)
    if (this.damageable==true && this.destroyed==false){
      this.health -= damage;
      if (this.health!<=0){
        this.destroy(damage,damageType)
      }
    }
  }
  

  heal(amount: number) {
    this.onHeal(amount);
    if (this.damageable == true && this.destroyed == false) {
      this.health += amount;
      if (this.health > this.maxHealth) {
        this.health = this.maxHealth;
      }
    }
  }

  destroy(damage: number, damageType: string) {
    if (this.destroyed == false) {
      this.destroyed = true;
      this.onDestroyed(damage, damageType);
      if (this.removeOnDestroy == true){
        GameController.current?.removeEntities(this.posX, this.posY);
      }else{
        this.sprite = this.deadSprite;
      }
    }
  }

  onTakeDamage(damage: number, damageType: string) {}

  onDestroyed(damage: number, damageType: string) {}

  onUse(user: Entity | null) {}

  onSteppedOn(user: Entity | null) {}

  onEndTurn(){}

  onHeal(amountHealed: number){}

}
