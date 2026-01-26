import { Entity } from './entity';
import { Player } from './player';
import { GameController } from './game.controller';
import { Items } from './items/items';
import { LightInterferanceUnit } from "./enemyTypes";

export class Wall1 extends Entity {
  override name = 'Wall';
  override sprite = '/sprites/entities/wall_placeholder_base.png';
  override zIndex = 4;
  override spriteTopCap = '/sprites/entities/wall_placeholder_topcap.png';
  override spriteBottomCap = '/sprites/entities/wall_placeholder_bottomcap.png';
  override spriteLeftCap = '/sprites/entities/wall_placeholder_leftcap.png';
  override spriteRightCap = '/sprites/entities/wall_placeholder_rightcap.png';
  override spriteTopLeftCorner = '/sprites/entities/wall_placeholder_topleftcorner.png';
  override spriteTopRightCorner = '/sprites/entities/wall_placeholder_toprightcorner.png';
  override spriteBottomLeftCorner = '/sprites/entities/wall_placeholder_bottomleftcorner.png';
  override spriteBottomRightCorner = '/sprites/entities/wall_placeholder_bottomrightcorner.png';
  override connectsWith = 'Wall';
  override tags = ['Wall'];
  override collidable = true;
  override damageable = true;
  override health = 500;
  override hiddenOutsideLOS = false;
  override blockLOS = true;
  override flammable = false;
}

export class WallCorner1 extends Entity {
  override name = 'Wall';
  override sprite = '/sprites/entities/wall_placeholder_base.png';
  override zIndex = 4;
  override spriteTopCap = '/sprites/entities/wall_placeholder_topcap.png';
  override spriteBottomCap = '/sprites/entities/wall_placeholder_bottomcap.png';
  override spriteLeftCap = '/sprites/entities/wall_placeholder_leftcap.png';
  override spriteRightCap = '/sprites/entities/wall_placeholder_rightcap.png';
  override spriteTopLeftCorner = '/sprites/entities/wall_placeholder_topleftcorner.png';
  override spriteTopRightCorner = '/sprites/entities/wall_placeholder_toprightcorner.png';
  override spriteBottomLeftCorner = '/sprites/entities/wall_placeholder_bottomleftcorner.png';
  override spriteBottomRightCorner = '/sprites/entities/wall_placeholder_bottomrightcorner.png';
  override connectsWith = 'Wall';
  override tags = ['Wall'];
  override collidable = true;
  override damageable = false;
  override health = 0;
  override hiddenOutsideLOS = false;
  override blockLOS = true;
  override flammable = false;
}

export class Door extends Entity {
  override name = 'Door';
  override sprite = '/sprites/entities/door_closed_horizontal.png';
  override zIndex = 9;
  override interactable = true;
  override collidable = true;
  override damageable = true;
  override health = 400;
  override hiddenOutsideLOS = false;
  override blockLOS = true;
  override flammable = false;

  closedSprite = '';
  openSprite = '';
  open = false;
  blocked = false;

  override onUse(user: Entity | null) {
    if (this.open == false) {
      this.open = true;
      this.sprite = this.openSprite;
      this.collidable = false;
      this.blockLOS = false;
      GameController.current?.addLog("A door creaks open.");
    } else {
      this.blocked = false;
      let entities = GameController.current?.getAllEntitiesOnTile(
        this.posX,
        this.posY
      )!;
      for (let i = 0; i < entities.length!; i++) {
        if (entities[i].name != 'Door') {
          console.log(entities[i].name);
          this.blocked = true;
        }
      }
      if (this.blocked == false) {
        this.open = false;
        this.sprite = this.closedSprite;
        this.collidable = true;
        this.blockLOS = true;
        GameController.current?.addLog("A door slams shut.");
      }
    }
    console.log(this.blocked);
  }
}

export class DoorHorizontal extends Door {
  override name = 'Door';
  override sprite = '/sprites/entities/door_closed_horizontal.png';
  override closedSprite = '/sprites/entities/door_closed_horizontal.png';
  override openSprite = '/sprites/entities/door_open_horizontal.png';
}

export class DoorVertical extends Door {
  override name = 'Door';
  override sprite = '/sprites/entities/door_closed_vertical.png';
  override closedSprite = '/sprites/entities/door_closed_vertical.png';
  override openSprite = '/sprites/entities/door_open_vertical.png';
}

export class RoomTransition extends Entity {
  override name = 'Door';
  override sprite = '/sprites/entities/door1.png';
  override interactable = true;
  override collidable = true;
  override damageable = false;
  override health = 500;
  override hiddenOutsideLOS = false;
  override blockLOS = true;
  override flammable = false;
  type: string;

  constructor(type: string) {
    super();
    this.type = type;
  }

  override onUse(user: Player) {
    GameController.current?.findRoom(user, this);
  }
}

export class ExplosiveBarrel extends Entity {
  override name = 'Explosive Barrel';
  override sprite = '/sprites/entities/explosiveBarrel.png';
  override interactable = true;
  override collidable = true;
  override damageable = true;
  override health = 10;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = false;

  override onTakeDamage() {
    GameController.current?.ignite(this.posX, this.posY, 100, true, true);
  }

  override onDestroyed() {
    GameController.current?.createExplosion(this.posX, this.posY, 3, 200, true, this.name);
  }
}

export class Crate extends Entity {
  override name = 'Crate';
  override sprite = '/sprites/entities/crate.png';
  override lootable = true;
  override interactable = true;
  override collidable = true;
  override damageable = true;
  override health = 25;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  lootTable = [];
}

export class WeaponCrate extends Entity {
  override name = 'Weapon Crate';
  override sprite = '/sprites/entities/crate_weapon.png';
  override lootable = true;
  override interactable = true;
  override collidable = true;
  override damageable = true;
  override health = 25;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  lootTable = [new Items().gun];
}

export class MedicalCrate extends Entity {
  override name = 'Medical Crate';
  override sprite = '/sprites/entities/crate_medical.png';
  override lootable = true;
  override interactable = true;
  override collidable = true;
  override damageable = true;
  override health = 25;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
  lootTable = [new Items().bandage];
}

export class CryoChamber extends Entity {
  override name = 'Cryo Chamber';
  override sprite = '/sprites/entities/cryochamber.png';
  override sizeOffsetX = 0;
  override sizeOffsetY = -16;
  override interactable = true;
  override collidable = true;
  override damageable = true;
  override health = 50;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;
}

export class WallSign1 extends Entity {
  override name = 'Wall';
  override sprite = '/sprites/entities/elevatorsignwall.png';
  override zIndex = 4;
  override spriteTopCap = '/sprites/entities/wall_placeholder_topcap.png';
  override spriteBottomCap = '/sprites/entities/wall_placeholder_bottomcap.png';
  override spriteLeftCap = '/sprites/entities/wall_placeholder_leftcap.png';
  override spriteRightCap = '/sprites/entities/wall_placeholder_rightcap.png';
  override spriteTopLeftCorner = '/sprites/entities/wall_placeholder_topleftcorner.png';
  override spriteTopRightCorner = '/sprites/entities/wall_placeholder_toprightcorner.png';
  override spriteBottomLeftCorner = '/sprites/entities/wall_placeholder_bottomleftcorner.png';
  override spriteBottomRightCorner = '/sprites/entities/wall_placeholder_bottomrightcorner.png';
  override connectsWith = 'Wall';
  override tags = ['Wall'];
  override collidable = true;
  override damageable = false;
  override health = 0;
  override hiddenOutsideLOS = false;
  override blockLOS = true;
  override flammable = false;
}

export class Mine extends Entity {
  override name = 'Landmine';
  override sprite = '/sprites/entities/mine.png';
  override lootable = false;
  override interactable = true;
  override collidable = false;
  override damageable = true;
  override health = 10;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = true;

  override onSteppedOn(user: Entity | null) {
    let msg = ""
    if (this.sprite == '/sprites/effects/hidden.png') {
      msg = "A hidden trap"
    }else{
      msg = this.name
    }
    GameController.current?.createExplosion(this.posX, this.posY, 3, 200, false, msg);
  }

  override onEndTurn(){
    this.sprite = "/sprites/effects/hidden.png";
  }

}

export class Spawnpoint extends Entity {
  override name = 'Spawnpoint';
  override sprite = '/sprites/crosshair_default_invalid.png';
  activated = false
  type: string;

  constructor(type: string) {
    super();
    this.type = type;
  }

  spawn(){
    if(!this.activated){
      this.activated = true;
      const controller = GameController.current;
      if (controller?.map && controller.map.isValidTile(this.posX, this.posY)) {
        //GameController.current?.loadEntity(this.posX, this.posY,LightInterferanceUnit, GameController.current.map);
      }
    }
  }

}

export class GlassShards extends Entity {
  override name = 'Glass Shards';
  override sprite = '/sprites/entities/glass_shards.png';
  override collidable = false;
  override damageable = false;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = false;

  override onSteppedOn(user: Entity | null) {
    if (user instanceof Player) {
      GameController.current?.addLog("You stepped on glass shards and cut up your feet!");
      user.Health.damageLimb('leftLeg', [
        ['Lacerations', 15],
        ['Bleeding', 20],
      ]);
      user.Health.damageLimb('rightLeg', [
        ['Lacerations', 15],
        ['Bleeding', 20],
      ]);
    }
  }
  
}
