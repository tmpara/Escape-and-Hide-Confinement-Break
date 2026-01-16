import { Entity } from './entity';
import { Player } from './player';
import { GameController } from './game.controller';

export class Wall1 extends Entity {
  override name = 'Wall';
  override sprite = '/sprites/entities/wall_placeholder_base.png';
  override tags = ['Wall'];
  override connectsWith = 'Wall';
  override spriteTopCap = '/sprites/entities/wall_placeholder_topcap.png';
  override spriteBottomCap = '/sprites/entities/wall_placeholder_bottomcap.png';
  override spriteLeftCap = '/sprites/entities/wall_placeholder_leftcap.png';
  override spriteRightCap = '/sprites/entities/wall_placeholder_rightcap.png';
  override spriteTopLeftCorner = '/sprites/entities/wall_placeholder_topleftcorner.png';
  override spriteTopRightCorner = '/sprites/entities/wall_placeholder_toprightcorner.png';
  override spriteBottomLeftCorner = '/sprites/entities/wall_placeholder_bottomleftcorner.png';
  override spriteBottomRightCorner = '/sprites/entities/wall_placeholder_bottomrightcorner.png';
  override collidable = true;
  override damageable = true;
  override health = 500;
  override hiddenOutsideLOS = false;
  override blockLOS = true;
  override flammable = false;
}

export class WallCorner1 extends Entity {
  override name = 'Wall';
  override tags = ['Wall'];
  override sprite = '/sprites/entities/wall_placeholder_base.png';
  override connectsWith = 'Wall';
  override spriteTopCap = '/sprites/entities/wall_placeholder_topcap.png';
  override spriteBottomCap = '/sprites/entities/wall_placeholder_bottomcap.png';
  override spriteLeftCap = '/sprites/entities/wall_placeholder_leftcap.png';
  override spriteRightCap = '/sprites/entities/wall_placeholder_rightcap.png';
  override spriteTopLeftCorner = '/sprites/entities/wall_placeholder_topleftcorner.png';
  override spriteTopRightCorner = '/sprites/entities/wall_placeholder_toprightcorner.png';
  override spriteBottomLeftCorner = '/sprites/entities/wall_placeholder_bottomleftcorner.png';
  override spriteBottomRightCorner = '/sprites/entities/wall_placeholder_bottomrightcorner.png';
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
  override collidable = true;
  override damageable = true;
  override health = 2;
  override hiddenOutsideLOS = true;
  override blockLOS = false;
  override flammable = false;

  override onTakeDamage() {
    GameController.current?.ignite(this.posX, this.posY, 100, true, true);
  }

  override onDestroyed() {
    GameController.current?.createExplosion(this.posX, this.posY, 3, 200, true);
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
}
