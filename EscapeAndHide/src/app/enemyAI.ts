import { range } from 'rxjs';
import { Entity } from './entity';
import { GameController } from './game.controller';
import { Player } from './player';
import { Torso } from './health/limbs';
import { Lacerations } from './health/afflictions';
import { Health, LimbName } from './health/health';
import { tile } from './tile';

export class BasicEnemyAI extends Entity {
  parentEntity: Entity | null = null;
  alerted = false;
  hostile = false;
  meleePreference = false;
  nonMelee = false;
  TargetCoords: Entity[] = [];
  LastKnownTargetCoords: [number, number] | null = null;
  energy = 3;
  sightRange = 7;
  attackRange = 3;
  optimalRange = 2;
  damage = 1;
  accuracy = 0.1; //chance to miss
  stunned = 0;
  Health = new Health(5000, 5000);

  async aiTurn() {
    await this.Main();
  }

  async Main(): Promise<void> {
    if (this.stunned > 0) {
      this.stunned -= 1;
      if (this.stunned < 0) {
        this.stunned = 0;
      }
      return;
    }
    if (!GameController.current) return;
    // update target list
    this.findTargets();

    const controller = GameController.current;
    const pauseMs = (controller as any).enemyStepDelay ?? 160;

    if (this.alerted && this.TargetCoords.length > 0) {
      // Has current targets: pursue and attack as before
      const target = this.TargetCoords[0] as Player;

      const dx = Math.abs(this.posX - target.posX);
      const dy = Math.abs(this.posY - target.posY);
      const distanceToTarget = Math.ceil(
        Math.max(dx, dy) + 0.5 * Math.min(dx, dy),
      );

      // If too close for ranged attack, move away
      if (
        this.meleePreference == false &&
        distanceToTarget < this.optimalRange
      ) {
        // console.log("Moving away to maintain attack range");
        // For ranged enemies, if player is too close, move away to optimal range
        const dx = this.posX - target.posX;
        const dy = this.posY - target.posY;
        const nx = this.posX + (dx > 0 ? 1 : dx < 0 ? -1 : 0);
        const ny = this.posY + (dy > 0 ? 1 : dy < 0 ? -1 : 0);

        // Check if the new position is valid and walkable
        if (
          controller.map &&
          controller.map.isValidTile(nx, ny) &&
          controller.isTileWalkable(nx, ny)
        ) {
          // Move away
          this.removeEntity(this.posX, this.posY);
          controller.loadEntity(nx, ny, this, controller.map);
          // Redraw and pause

          controller.drawGrid?.();
          controller.drawPlayer?.();
          await (controller.delay?.(pauseMs) ??
            new Promise((res) => setTimeout(res, pauseMs)));
        }
        return;
      }

      // If in ranged attack window -> ranged attack
      if (
        distanceToTarget <= this.attackRange &&
        distanceToTarget >= this.optimalRange &&
        this.meleePreference == false
      ) {
        // console.log("In ranged attack range");
        // console.log("Distance to target: " + distanceToTarget);
        this.RangedAttack();
        // show action
        controller.drawGrid?.();
        controller.drawPlayer?.();
        await (controller.delay?.(pauseMs) ??
          new Promise((res) => setTimeout(res, pauseMs)));
        return;
      }

      // If adjacent -> melee
      if (distanceToTarget === 1) {
        if (this.nonMelee == true) {
          // For non-melee enemies, if player is too close, move away to attack range
          const dx = this.posX - target.posX;
          const dy = this.posY - target.posY;
          const nx = this.posX + (dx > 0 ? 1 : dx < 0 ? -1 : 0);
          const ny = this.posY + (dy > 0 ? 1 : dy < 0 ? -1 : 0);

          // Check if the new position is valid and walkable
          if (
            controller.map &&
            controller.map.isValidTile(nx, ny) &&
            controller.isTileWalkable(nx, ny)
          ) {
            // Move away
            this.removeEntity(this.posX, this.posY);
            controller.loadEntity(nx, ny, this, controller.map);
            // Redraw and pause
            controller.drawGrid?.();
            controller.drawPlayer?.();
            await (controller.delay?.(pauseMs) ??
              new Promise((res) => setTimeout(res, pauseMs)));
          }
        } else {
          this.MeleeAttack();
          return;
        }

        controller.drawGrid?.();
        controller.drawPlayer?.();
        await (controller.delay?.(pauseMs) ??
          new Promise((res) => setTimeout(res, pauseMs)));
        return;
      }

      // Otherwise: path towards the player using A* and spend movement (energy)
      const path = controller.findPathAStar(
        this.posX,
        this.posY,
        target.posX,
        target.posY,
      );
      if (!path || path.length <= 1) return; // no movement possible

      // move up to `energy` steps along the path (path[0] == start)
      const steps = Math.min(this.energy, path.length - 1);
      for (let step = 1; step <= steps; step++) {
        const [nx, ny] = path[step];

        // safety checks: bounds and walkability
        if (!controller.map || !controller.map.isValidTile(nx, ny)) break;

        // if there's a door on the next tile and it's closed, try to open it and stop moving this turn
        const door = controller.getDoorOnTile(nx, ny);

        if (door) {
          if (typeof door.onUse === 'function') {
            if (door.open == false) {
              door.onUse();
            }
          }
          // redraw + pause so player sees the open attempt
          controller.drawGrid?.();
          controller.drawPlayer?.();
          await (controller.delay?.(pauseMs) ??
            new Promise((res) => setTimeout(res, pauseMs)));
        }

        // allow stepping onto the goal even if occupied by non-walkable (attack intent),
        // otherwise require walkable
        const isGoal = nx === target.posX && ny === target.posY;
        if (!isGoal && !controller.isTileWalkable(nx, ny)) break;

        // remove from current tile and place at new tile via controller API
        this.removeEntity(this.posX, this.posY);
        controller.loadEntity(nx, ny, this, controller.map);

        // redraw and pause after each step so player can observe movement
        controller.drawGrid?.();
        controller.drawPlayer?.();
        await (controller.delay?.(pauseMs) ??
          new Promise((res) => setTimeout(res, pauseMs)));

        // after moving check current distance to the (possibly moved) player
        const postDistance = Math.max(
          Math.abs(this.posX - target.posX),
          Math.abs(this.posY - target.posY),
        );
        if (postDistance <= this.attackRange) {
          // if within melee range do melee, otherwise ranged
          if (postDistance === 1) {
            this.MeleeAttack();
          } else {
            this.RangedAttack();
          }
          // show attack and pause, then stop further movement this turn
          controller.drawGrid?.();
          controller.drawPlayer?.();
          await (controller.delay?.(pauseMs) ??
            new Promise((res) => setTimeout(res, pauseMs)));
          break;
        }
      }
    } else if (this.LastKnownTargetCoords) {
      // No current targets, but has last known position: move towards it
      const [lx, ly] = this.LastKnownTargetCoords;
      const path = controller.findPathAStar(this.posX, this.posY, lx, ly);
      if (!path || path.length <= 1) {
        // Can't reach last known, clear it
        this.LastKnownTargetCoords = null;
        return;
      }

      // move up to `energy` steps along the path
      const steps = Math.min(this.energy, path.length - 1);
      for (let step = 1; step <= steps; step++) {
        const [nx, ny] = path[step];

        // safety checks: bounds and walkability
        if (!controller.map || !controller.map.isValidTile(nx, ny)) break;

        // if there's a door on the next tile, try to open it
        const door = controller.getDoorOnTile(nx, ny);
        if (door) {
          if (typeof door.onUse === 'function') {
            if (door.open == false) {
              door.onUse();
            }
          }
          controller.drawGrid?.();
          controller.drawPlayer?.();
          await (controller.delay?.(pauseMs) ??
            new Promise((res) => setTimeout(res, pauseMs)));
        }

        // require walkable (since no attack intent here)
        if (!controller.isTileWalkable(nx, ny)) break;

        // move
        this.removeEntity(this.posX, this.posY);
        controller.loadEntity(nx, ny, this, controller.map);

        // redraw and pause
        controller.drawGrid?.();
        controller.drawPlayer?.();
        await (controller.delay?.(pauseMs) ??
          new Promise((res) => setTimeout(res, pauseMs)));

        // if reached last known, clear it
        if (nx === lx && ny === ly) {
          this.LastKnownTargetCoords = null;
          break;
        }
      }
    }
    // else: no targets and no last known, do nothing
  }

  removeEntity(x: number, y: number) {
    const controller = GameController.current;
    if (!controller || !controller.map) return;
    if (!controller.map.isValidTile(x, y)) return;
    const tile = controller.map.tiles[x][y];
    if (!tile) return;

    const ents = tile.entity as any;
    if (!ents) return;

    // handle both array or single-entity cases defensively
    if (Array.isArray(ents)) {
      for (let i = ents.length - 1; i >= 0; i--) {
        if (ents[i] === this) {
          ents.splice(i, 1);
        }
      }
      // ensure array remains (empty array is fine)
      tile.entity = ents;
    } else {
      if (ents === this) {
        tile.entity = [];
      }
    }
  }

  findTargets() {
    let temp = 0;
    let allEntities: Entity[] = [];
    let entities: Entity[] = [];
    let tiles = GameController.current?.getTilesInSphere(
      this.posX,
      this.posY,
      this.sightRange,
    )!;
    tiles.forEach((tile) => {
      if (!GameController.current) return;
      if (
        GameController.current?.isLOSObstructed(
          this.posX,
          this.posY,
          tile[0],
          tile[1],
          true,
          true,
        ) == false
      ) {
        entities = GameController.current?.getAllEntitiesOnTile(
          tile[0],
          tile[1],
        );
        allEntities = allEntities?.concat(entities);
        for (let i = 0; i < entities!.length; i++) {
          if (entities![i] instanceof Player) {
            this.alerted = true;
            if (!this.TargetCoords.includes(entities![i])) {
              this.TargetCoords.push(entities![i]);
            }
            // update last known position
            this.LastKnownTargetCoords = [entities![i].posX, entities![i].posY];
          }
        }
      }
    });
    for (let i = 0; i < allEntities.length; i++) {
      if (allEntities[i] instanceof Player) {
        temp = 1;
      }
    }
    if (temp == 0) {
      this.alerted = false;
      this.TargetCoords = [];
      // do not clear LastKnownTargetCoords here
    }
  }
  RangedAttack() {
    let targetLimb: LimbName = 'torso';
    let miss = Math.random(); //chance to miss or hit random limb
    if (miss < this.accuracy) {
      return; //missed attack
    } else if (miss < this.accuracy * 2) {
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
    const controller = GameController.current;
    if (!controller) return;
    if (this.TargetCoords.length == 0) return;
    const target = this.TargetCoords[0] as Player;
    let damageDealt = this.damage;
    target.Health.damageLimb(targetLimb, [['Lacerations', damageDealt]]);
  }

  MeleeAttack() {
    let targetLimb: LimbName = 'torso';
    let miss = Math.random(); //chance to miss or hit random limb
    if (miss < this.accuracy) {
      return; //missed attack
    } else if (miss < this.accuracy * 2) {
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
    const controller = GameController.current;
    if (!controller) return;
    if (this.TargetCoords.length == 0) return;
    const target = this.TargetCoords[0] as Player;
    let damageDealt = this.damage * 2;
    target.Health.damageLimb(targetLimb, [['Lacerations', damageDealt]]);
  }
}

export class LightInterferanceUnitAI extends BasicEnemyAI {
  override hostile = true;
  override meleePreference = false;
  override energy = 3;
  override sightRange = 5;
  override attackRange = 3;
  override damage = 1;
  override accuracy = 0.1; //chance to miss

  override RangedAttack() {
    let targetLimb: LimbName = 'torso';
    let miss = Math.random(); //chance to miss or hit random limb
    if (miss < this.accuracy) {
      return; //missed attack
    } else if (miss < this.accuracy * 2) {
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
    const controller = GameController.current;
    if (!controller) return;
    if (this.TargetCoords.length == 0) return;
    const target = this.TargetCoords[0] as Player;
    let damageDealt = this.damage;
    target.Health.damageLimb(targetLimb, [
      ['Lacerations', damageDealt * 2],
      ['Bleeding', damageDealt * 2],
    ]);
    target.Health.torso.zapped.increaseSeverity(damageDealt * 5);
  }

  override MeleeAttack() {
    let targetLimb: LimbName = 'torso';
    let miss = Math.random(); //chance to miss or hit random limb
    if (miss < this.accuracy) {
      return; //missed attack
    } else if (miss < this.accuracy * 2) {
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
    const controller = GameController.current;
    if (!controller) return;
    if (this.TargetCoords.length == 0) return;
    const target = this.TargetCoords[0] as Player;
    let damageDealt = this.damage * 2;
    target.Health.damageLimb(targetLimb, [
      ['Lacerations', damageDealt * 2],
      ['Bleeding', damageDealt * 2],
    ]);
    target.Health.torso.zapped.increaseSeverity(damageDealt * 5);
  }
}

export class MediumInterferanceUnitAI extends BasicEnemyAI {
  override hostile = true;
  override meleePreference = false;
  override energy = 3;
  override sightRange = 7;
  override attackRange = 4;
  override damage = 5;
  override accuracy = 0.4; //chance to miss
  burst = 4; //number of shots in a burst

  override async RangedAttack() {
    let targetLimb: LimbName = 'head';
    for (let i = 0; i < this.burst; i++) {
      let miss = Math.random(); //chance to miss or hit random limb
      if (miss < this.accuracy) {
        return; //missed attack
      } else if (miss < this.accuracy * 2) {
        const limbs: LimbName[] = [
          'torso',
          'leftArm',
          'rightArm',
          'leftLeg',
          'rightLeg',
        ];
        const randomIndex = Math.floor(Math.random() * limbs.length);
        targetLimb = limbs[randomIndex];
      }
      const controller = GameController.current;
      if (!controller) return;
      if (this.TargetCoords.length == 0) return;
      const target = this.TargetCoords[0] as Player;
      let damageDealt = this.damage;
      target.Health.damageLimb(targetLimb, [
        ['GunshotWound', damageDealt],
        ['Bleeding', damageDealt * 5],
      ]);
      // Add 0.5 second cooldown between shots
      (await controller.delay?.(200)) ??
        new Promise((res) => setTimeout(res, 200));
    }
  }

  override MeleeAttack() {
    let targetLimb: LimbName = 'head';
    let miss = Math.random(); //chance to miss or hit random limb
    if (miss < this.accuracy) {
      return; //missed attack
    } else if (miss < this.accuracy * 2) {
      const limbs: LimbName[] = [
        'torso',
        'leftArm',
        'rightArm',
        'leftLeg',
        'rightLeg',
      ];
      const randomIndex = Math.floor(Math.random() * limbs.length);
      targetLimb = limbs[randomIndex];
    }
    const controller = GameController.current;
    if (!controller) return;
    if (this.TargetCoords.length == 0) return;
    const target = this.TargetCoords[0] as Player;
    let damageDealt = 10;
    target.Health.damageLimb(targetLimb, [
      ['Lacerations', damageDealt * 2],
      ['Bleeding', damageDealt * 5],
    ]);
  }
}

export class HeavyInterferanceUnitAI extends BasicEnemyAI {
  override hostile = true;
  override meleePreference = false;
  override energy = 2;
  override sightRange = 8;
  override attackRange = 5;
  override optimalRange = this.attackRange - 2;
  override damage = 10;
  override accuracy = 0.6; //chance to miss
  burst = 4; //number of shots in a burst
  controller = GameController.current;

  getRandomTileInRadius(radius: number) {
    const target = this.TargetCoords[0] as Player;
    if (!this.controller) return null;
    const tiles = this.controller.getTilesInSphere(
      target.posX,
      target.posY,
      radius,
    );
    if (tiles.length == 0) return null;
    const randomIndex = Math.floor(Math.random() * tiles.length);
    return tiles[randomIndex];
  }

  override async RangedAttack() {
    this.controller = GameController.current;
    if (this.controller == null) {
      return;
    }
    let explosionRadius = 2;
    let missRadius = 3;
    let attackRadius = 2;

    for (let i = 0; i < this.burst; i++) {
      let miss = Math.random(); //chance to miss or hit random limb
      if (miss < this.accuracy) {
        let missTile = this.getRandomTileInRadius(missRadius);
        if (missTile) {
          this.controller.createExplosion(
            missTile[0],
            missTile[1],
            explosionRadius,
            this.damage,
          );
        }
      } else {
        let attackTile = this.getRandomTileInRadius(attackRadius);
        if (attackTile) {
          this.controller.createExplosion(
            attackTile[0],
            attackTile[1],
            explosionRadius,
            this.damage,
          );
        }
      }
      // Add 0.5 second cooldown between shots
      (await this.controller.delay?.(200)) ??
        new Promise((res) => setTimeout(res, 200));

      if (this.TargetCoords.length == 0) return;
    }
    this.stunned += 1; //heavy unit stuns itself after attack
  }
}

export class OppressorUnitAI extends BasicEnemyAI {
  override hostile = true;
  override meleePreference = true;
  override energy = 2;
  override sightRange = 6;
  override damage = 30;
  override accuracy = 0.05; //chance to miss

  override MeleeAttack() {
    let damageDealt = this.damage;
    let targetLimb: LimbName = 'torso';
    let miss = Math.random(); //chance to miss or hit random limb
    let stunChance = Math.random(); //chance to stun
    if (miss < this.accuracy) {
      return; //missed attack
    } else if (miss < this.accuracy * 2) {
      const limbs: LimbName[] = [
        'head',
        'leftArm',
        'rightArm',
        'leftLeg',
        'rightLeg',
      ];
      const randomIndex = Math.floor(Math.random() * limbs.length);
      targetLimb = limbs[randomIndex];
      damageDealt = damageDealt / 2;
    }
    const controller = GameController.current;
    if (!controller) return;
    if (this.TargetCoords.length == 0) return;
    const target = this.TargetCoords[0] as Player;

    target.Health.damageLimb(targetLimb, [['Fracture', damageDealt]]);
    if (stunChance < 0.3) {
      target.Health.torso.zapped.increaseSeverity(20); //change to stun affliction later
    }
  }
}
export class ScorcherUnitAI extends BasicEnemyAI {
  override hostile = true;
  override meleePreference = false;
  override nonMelee = true;
  override energy = 3;
  override sightRange = 6;
  override attackRange = 3;
  override damage = 5;

  getConeTiles(
    centerX: number,
    centerY: number,
    range: number,
    angle: number,
    coneAngle: number,
  ): [number, number][] {
    const tiles: [number, number][] = [];
    const controller = GameController.current;
    for (let x = centerX - range; x <= centerX + range; x++) {
      for (let y = centerY - range; y <= centerY + range; y++) {
        const dx = Math.abs(x - centerX);
        const dy = Math.abs(y - centerY);
        const dist = Math.ceil(Math.max(dx, dy) + 0.5 * Math.min(dx, dy));
        if (dist > range || dist === 0) continue; // exclude center

        // skip tiles that are out of the current map bounds
        if (controller && controller.map && !controller.map.isValidTile(x, y))
          continue;

        const angleToTile = Math.atan2(y - centerY, x - centerX);
        let angleDiff = angleToTile - angle;
        // Robust normalization to [-PI, PI]
        while (angleDiff <= -Math.PI) angleDiff += 2 * Math.PI;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        // small epsilon to avoid cutting off exact-edge tiles due to fp errors
        const eps = 1e-9;
        if (Math.abs(angleDiff) <= coneAngle / 2 + eps) {
          tiles.push([x, y]);
        }
      }
    }
    return tiles;
  }

  override RangedAttack() {
    const controller = GameController.current;
    if (!controller || this.TargetCoords.length === 0) return;
    const target = this.TargetCoords[0] as Player;
    const dx = target.posX - this.posX;
    const dy = target.posY - this.posY;
    const angleToTarget = Math.atan2(dy, dx);
    const coneTiles = this.getConeTiles(
      this.posX,
      this.posY,
      this.attackRange + 2,
      angleToTarget,
      Math.PI / 3,
    ); // 60 degree cone

    for (const [x, y] of coneTiles) {
      // Apply damage or effect, e.g., create fire or damage entities
      const entities = controller.getAllEntitiesOnTile(x, y);
      let tileRange = Math.max(
        Math.abs(x - this.posX),
        Math.abs(y - this.posY),
      );
      let fireChance = controller.generateRandomNumber(1, tileRange);
      if (fireChance <= 2) {
        controller.ignite(x, y, 100 - tileRange * 15, true, true);
      }

      for (const entity of entities) {
        if (entity instanceof Player) {
          // Damage player, perhaps with fire damage
          // For now, use existing damage logic
        }
      }
    }

    this.stunned += 1; //scorcher stuns itself after attack
    console.log(
      'Scorcher used Ranged Attack and is stunned for ' +
        this.stunned +
        ' turn.',
    );
  }
}
