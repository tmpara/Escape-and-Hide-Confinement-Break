import {
  LeftArm,
  RightArm,
  LefLeg,
  RightLeg,
  Head,
  Torso,
  Limbs,
} from './limbs';
import {
  Hypoxemia,
  Bleeding,
  Lacerations,
  Fracture,
  Bloodloss,
} from './afflictions';
export type LimbName =
  | 'leftArm'
  | 'rightArm'
  | 'leftLeg'
  | 'rightLeg'
  | 'head'
  | 'torso';
type affliction = [string, number];
export class Health {
  maxBlood: number = 5000;
  currentBlood: number = 5000;
  regeneration: number = 10;
  isUnconscious: boolean = false;
  leftArm: LeftArm = new LeftArm();
  rightArm: RightArm = new RightArm();
  leftLeg: LefLeg = new LefLeg();
  rightLeg: RightLeg = new RightLeg();
  head: Head = new Head();
  torso: Torso = new Torso();
  hypoxemia: Hypoxemia = new Hypoxemia();
  bloodLoss: Bloodloss = new Bloodloss();
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

  hitRandomLimb(bleedingIncrease: number) {}

  damageLimb(limb: LimbName, afflictions: affliction[]) {
    for (let affliction of afflictions) {
      if (affliction[0] === 'Lacerations') {
        this[limb].addLaceration(affliction[1]);
      }
      if (affliction[0] === 'Bleeding') {
        this[limb].addBleeding(affliction[1]);
      }
      if (affliction[0] === 'Fracture') {
        this[limb].addFracture();
      }
    }
  }

  healLimb(limb: LimbName, afflictionType: affliction[], amount: number) {
    for (let affliction of afflictionType) {
      if (affliction[0] === 'Lacerations') {
        this[limb].lacerations.decreaseSeverity(amount);
      }
      if (affliction[0] === 'Bleeding') {
        this[limb].bleeding.decreaseSeverity(amount);
      }
    }
  }
  updateAfflictions() {
    this.bloodLoss.severity = 0;
    for (let limb of this.limbs) {
      this.bloodLoss.increaseSeverity(limb.bleeding.severity);
    }
    console.log('bloodloss: ' + this.bloodLoss.severity);
    this.currentBlood -= this.bloodLoss.severity;
    if (this.currentBlood < 0) {
      this.currentBlood = 0;
    } else {
      if (this.currentBlood + this.regeneration < this.maxBlood) {
        this.currentBlood += this.regeneration;
      } else {
        this.currentBlood = this.maxBlood;
      }
    }
    if (
      this.currentBlood < this.maxBlood * 0.5 &&
      this.hypoxemia.severity < 100
    ) {
      this.hypoxemia.increaseSeverity(this.bloodLoss.severity / 20);
      console.log('hypoxemia: ' + this.hypoxemia.severity);
      if (this.hypoxemia.severity >= 100) {
        this.isUnconscious = true;
      }
    }
  }

  bleedingRegen() {
    for (let limb of this.limbs) {
      limb.bleeding.naturalHeal(this.regeneration);
    }
    this.bloodLoss.decreaseSeverity(this.regeneration);
  }

  stopBleeding() {
    for (let limb of this.limbs) {
      limb.bleeding.severity = 0;
    }
    this.bloodLoss.severity = 0;
  }
}
