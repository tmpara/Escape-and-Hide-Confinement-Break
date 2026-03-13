import {
  Bleeding,
  Lacerations,
  Fracture,
  Zapped,
  Burn,
  GunshotWound,
} from './afflictions';
export class Limbs {
  currentHealth = 100;
  maxHealth = this.currentHealth;
  bleeding: Bleeding = new Bleeding();
  lacerations: Lacerations = new Lacerations();
  fracture: Fracture = new Fracture();
  zapped: Zapped = new Zapped();
  burn: Burn = new Burn();
  gunshotWound: GunshotWound = new GunshotWound();
  damagingAfflictions = [Lacerations, Burn, GunshotWound];
  constructor() {}

  addBleeding(amount: number) {
    this.bleeding.increaseSeverity(amount);
  }
  addLaceration(amount: number) {
    this.lacerations.increaseSeverity(amount);
    if (amount > 30 && this.fracture.severity === 0 && Math.random() < 0.5) {
      this.addFracture();
    }
  }
  addFracture() {
    this.fracture.increaseSeverity(100);
  }
  removeFracture() {
    this.fracture.decreaseSeverity(100);
  }

  returnAfflictions() {
    console.log(
      'Bleeding: ' +
        this.bleeding.severity +
        ', Lacerations: \n' +
        this.lacerations.severity +
        ', Fracture: \n' +
        this.fracture.severity +
        ', Zapped: \n' +
        this.zapped.severity +
        ', Burn: \n' +
        this.burn.severity +
        ', GunshotWound: \n' +
        this.gunshotWound.severity,
    );
    console.log(this.currentHealth);
    return [
      this.bleeding,
      this.lacerations,
      this.fracture,
      this.zapped,
      this.burn,
      this.gunshotWound,
    ];
  }
}

export class LeftArm extends Limbs {
  override currentHealth = 50;
  override maxHealth = this.currentHealth;
  constructor() {
    super();
  }
}
export class RightArm extends Limbs {
  override currentHealth = 50;
  override maxHealth = this.currentHealth;
  constructor() {
    super();
  }
}

export class LefLeg extends Limbs {
  override currentHealth = 50;
  override maxHealth = this.currentHealth;
  constructor() {
    super();
  }
}

export class RightLeg extends Limbs {
  override currentHealth = 50;
  override maxHealth = this.currentHealth;
  constructor() {
    super();
  }
}

export class Head extends Limbs {
  override currentHealth = 40;
  override maxHealth = this.currentHealth;
  constructor() {
    super();
  }
}

export class Torso extends Limbs {
  override currentHealth = 100;
  override maxHealth = this.currentHealth;
  constructor() {
    super();
  }
}
