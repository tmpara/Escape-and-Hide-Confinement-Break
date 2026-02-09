import { GameController } from './game.controller';
export abstract class Entity {
  
  id=0;
  name = "";
  description = "";
  sprite = "placeholder.png";
  deadSprite = "";
  sizeOffsetX = 0;
  sizeOffsetY = 0;
  // footprint controls how many tiles the entity visually occupies (width x height)
  footprintWidth = 1;
  footprintHeight = 1;
  posX = 0;
  posY = 0;
  zIndex = 5;
  spriteTopCap = "";
  spriteBottomCap = "";
  spriteLeftCap = "";
  spriteRightCap = "";
  spriteTopLeftCorner = "";
  spriteTopRightCorner = "";
  spriteBottomLeftCorner = "";
  spriteBottomRightCorner = "";
  connectsWith: string | null = null
  tags: string[] | null = null;
  interactable = false;
  collidable = false;
  pushable = false;
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
        GameController.current?.removeEntities(this.posX, this.posY,this.id);
      }else{
        this.sprite = this.deadSprite;
      }
    }
  }

  onSpawn() {}

  onTakeDamage(damage: number, damageType: string) {}

  onDestroyed(damage: number, damageType: string) {}

  onUse(user: Entity | null) {}

  onSteppedOn(user: Entity | null) {}

  onEndTurn(){}

  onHeal(amountHealed: number){}

}
