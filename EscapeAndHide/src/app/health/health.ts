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

import { Genetics } from './genetics';
import { GameController } from '../game.controller';
import { 
  Internals,
  Heart,
  Lungs,
  Brain,
  Liver,
} from './internals';
export type LimbName =
  | 'leftArm'
  | 'rightArm'
  | 'leftLeg'
  | 'rightLeg'
  | 'head'
  | 'torso';
export type affliction = [string, number];

export class Health {
  gameController = GameController;
  genetics = new Genetics();
  genes = this.genetics.genes;
  maxHealth: number = 5000;
  currentHealth: number = 5000;
  regeneration: number = 1;
  isUnconscious: boolean = false;

  heart: Heart = new Heart();
  lungs: Lungs = new Lungs();
  brain: Brain = new Brain();
  liver: Liver = new Liver();

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

  constructor(maxHealth: number, currentHealth: number) {
    this.maxHealth = maxHealth;
    this.currentHealth = currentHealth;
  }

  updateBars() {
      GameController.current?.setHealthBarFlag(true);
      GameController.current?.setEnergyBarFlag(true);
  }

  hitRandomLimb(bleedingIncrease: number) {}
  
  damageLimb(limb: LimbName, afflictions: affliction[]) {  
  for (let affliction of afflictions) {
      if (affliction[0] == 'Lacerations') {
        this[limb].lacerations.increaseSeverity(affliction[1]);
      }
      if (affliction[0] == 'Bleeding') {
        this[limb].bleeding.increaseSeverity(affliction[1]);
      }
      if (affliction[0] == 'Zapped') {
        this[limb].zapped.increaseSeverity(affliction[1]);
      }
      if (affliction[0] == 'GunshotWound') {
        this[limb].gunshotWound.increaseSeverity(affliction[1]);
      }
      if (affliction[0] == 'Burn') {
        this[limb].burn.increaseSeverity(affliction[1]);
      }
      if (affliction[0] == 'Fracture') {
        this[limb].addFracture();
      }
    }
    this.updateAfflictions();
  }

  healLimb(afflictionType: affliction[]) {
    
    const limb = GameController.current?.selectedLimb as LimbName;
    for (let affliction of afflictionType) {
      if (affliction[0] === 'Lacerations') {
        this[limb].lacerations.decreaseSeverity(affliction[1]);
      }
      if (affliction[0] === 'Bleeding') {
        this[limb].bleeding.decreaseSeverity(affliction[1]);
      }
      if (affliction[0] === 'Zapped') {
        this[limb].zapped.decreaseSeverity(affliction[1]);
      }
      if (affliction[0] == 'GunshotWound') {
        this[limb].gunshotWound.decreaseSeverity(affliction[1]);
      }
      if (affliction[0] == 'Burn') {
        this[limb].burn.decreaseSeverity(affliction[1]);
      }
      if (affliction[0] == 'Fracture') {
        this[limb].addFracture();
      }
    }
    this.updateAfflictions();
  }
  updateAfflictions() {
    //Genetic effects

    this.genetics.genes.forEach((gene) => {
      if(gene.targetInternal == "Heart"){
      this.genetics.triggerGeneEffects(gene, this.heart);}
      if(gene.targetInternal == "Lungs"){
      this.genetics.triggerGeneEffects(gene, this.lungs);}
      if(gene.targetInternal == "Brain"){
      this.genetics.triggerGeneEffects(gene, this.brain);}
      if(gene.targetInternal == "Liver"){
      this.genetics.triggerGeneEffects(gene, this.liver);}
    });
    
    // Apply genetic effects
    //this.maxHealth = 5000 + this.liver.additionalBlood;
    //this.regeneration = 1 + this.heart.bloodRegen + this.liver.bloodRegen;



    this.bloodLoss.severity = 0;
    for (let limb of this.limbs) {
      this.bloodLoss.increaseSeverity(limb.bleeding.severity);
    }
    //console.log('bloodloss: ' + this.bloodLoss.severity);
    this.currentHealth -= this.bloodLoss.severity;
    if (this.currentHealth < 0) {
      this.currentHealth = 0;
    } else {
      if (this.currentHealth + this.regeneration < this.maxHealth) {
        this.currentHealth += this.regeneration;
      } else {
        this.currentHealth = this.maxHealth;
      }
    }
    if (
      this.currentHealth < this.maxHealth * 0.5 &&
      this.hypoxemia.severity < 100
    ) {
      this.hypoxemia.increaseSeverity(this.bloodLoss.severity / 20);
      //console.log('hypoxemia: ' + this.hypoxemia.severity);
      if (this.hypoxemia.severity >= 100) {
        this.isUnconscious = true;
      }
    }
    this.updateBars();
    this.gameController.current?.setAfflictionsFlag(true);
  }

  bleedingRegen() {
    for (let limb of this.limbs) {
      limb.bleeding.naturalHeal(this.regeneration);
    }
    this.bloodLoss.decreaseSeverity(this.regeneration);
    this.updateBars();
  }

  stopBleeding() {
    for (let limb of this.limbs) {
      limb.bleeding.severity = 0;
    }
    this.bloodLoss.severity = 0;
    this.updateBars();
  }
}
