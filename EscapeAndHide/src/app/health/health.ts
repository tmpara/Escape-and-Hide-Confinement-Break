import {
  LeftArm,
  RightArm,
  LefLeg,
  RightLeg,
  Head,
  Torso,
  Limbs,
} from './limbs';
export class Health {
  maxBlood: number = 5000; // max amount of blood in ml
  currentBlood: number = 5000; // current amount of blood in ml
  bleedingRate: number = 0; //in ml per turn
  regeneration: number = 50; //base 50ml, how much health is regenerated each turn
  leftArm: LeftArm = new LeftArm();
  rightArm: RightArm = new RightArm();
  leftLeg: LefLeg = new LefLeg();
  rightLeg: RightLeg = new RightLeg();
  head: Head = new Head();
  torso: Torso = new Torso();
  limbs: Limbs[] = [
    this.leftArm,
    this.rightArm,
    this.leftLeg,
    this.rightLeg,
    this.head,
    this.torso,
  ];

  constructor(maxBlood: number, currentHealth: number) {
    this.maxBlood = maxBlood;
    this.currentBlood = currentHealth;
  }

  hitRandomLimb(bleedingIncrease: number) {
    const limb = this.limbs[Math.floor(Math.random() * this.limbs.length)];
    if (limb.bleeding + bleedingIncrease < limb.afflictionLimit) {
      limb.bleeding = limb.afflictionLimit;
    } else {
      limb.bleeding += bleedingIncrease;
    }
    if (Math.floor(Math.random() * 100) + 1 < 20) {
      limb.addFracture();
    }
  }

  damage() {
    this.bleedingRate = 0;
    for (let limb of this.limbs) {
      this.bleedingRate += limb.bleeding;
    }
    this.currentBlood -= this.bleedingRate;
    if (this.currentBlood < 0) {
      this.currentBlood = 0;
    } else {
      if (this.currentBlood + this.regeneration < this.maxBlood) {
        this.currentBlood += this.regeneration;
      } else {
        this.currentBlood = this.maxBlood;
      }
    }
  }

  naturalHeal() {
    for (let limb of this.limbs) {
      limb.naturalHeal();
    }
  }

  stopBleeding() {
    for (let limb of this.limbs) {
      limb.bleeding = 0;
    }
    this.bleedingRate = 0;
  }
}
