import { GameController } from './game.controller';
import { Afflcition } from './health/afflictions';
import { affliction, LimbName } from './health/health';
import { Inventory } from './inventory/inventory';
import { Item } from './items/items';
import { Player } from './player';
export abstract class Entity {
  
  id=0;
  name = "";
  description = "";
  sprite = "placeholder.png";
  deadSprite = "";
  sizeOffsetX = 0;
  sizeOffsetY = 0;
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
  Health: import('./health/health').Health | null = null;
  damageResistance = 0;
  hiddenOutsideLOS = false;
  blockLOS = false;
  flammable = false;
  lootable = false;
  maxHealth = this.health;
  destroyed = false;
  removeOnDestroy = true;
  fireValue = 0;
  ai = false;
  itemPool: Item[] = [];
  inventorySize = 0;
  inventory = new Inventory();

  takeDamage(user: any) {
    let targetLimb: LimbName = 'torso';
    if (!this.Health) return;
    let miss = Math.random();
    if (miss > user.accuracy) {
      return; //missed attack
    } else if (miss > user.accuracy * 2) {
      const limbs: LimbName[] = [
        'head',
        'leftArm',
        'rightArm',
        'leftLeg',
        'rightLeg',
      ];
      const randomIndex = Math.floor(Math.random() * limbs.length);
      targetLimb = limbs[randomIndex];
    }
    let afflictions: affliction[] = [];
    if (user && user.inventory.weaponSlot && Array.isArray(user.inventory.weaponSlot.afflictions)) {
      for (const a of user.inventory.weaponSlot.afflictions) {
        if (Array.isArray(a) && a.length >= 2) {
          afflictions.push([a[0], a[1]]);
        }
      }
    }
    this.Health.damageLimb(targetLimb, afflictions);
  }

  takeStructureDamage(damage: number) {
    this.onTakeDamage(damage);
    this.health -= damage;
    if (this.health <= 0) {
      this.destroy(damage);
    }
  }

  heal(amount: number) {
    this.onHeal(amount);
    if (this.damageable == true && this.destroyed == false) {
      if (this.Health) {
        this.Health.currentHealth += amount;
        if (this.Health.currentHealth > this.Health.maxHealth) {
          this.Health.currentHealth = this.Health.maxHealth;
        }
      } else {
        this.health += amount;
        if (this.health > this.maxHealth) {
          this.health = this.maxHealth;
        }
      }
    }
  }

  destroy(damage: number) {
    if (this.destroyed == false) {
      this.destroyed = true;
      this.onDestroyed(damage);
      if (this.removeOnDestroy == true){
        GameController.current?.removeEntities(this.posX, this.posY,this.id);
      }else{
        this.sprite = this.deadSprite;
      }
    }
    console.log('entity inventory: ', this.inventory.inventorySlots);
  }

  onTakeDamage(damage: number) {}

  onDestroyed(damage: number) {}

  onUse(user: Entity | null) {}

  onSteppedOn(user: Entity | null) {}

  onEndTurn() {}

  onHeal(amountHealed: number) {}

  onSpawn() {}
}
