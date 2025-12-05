import { Bleeding, Lacerations, Fracture } from './afflictions';
export class Limbs {
  bleeding: Bleeding = new Bleeding();
  lacerations: Lacerations = new Lacerations();
  fracture: Fracture = new Fracture();
  constructor() {}

  addBleeding(amount: number) {
    this.bleeding.increaseSeverity(amount);
  }
  addLaceration(amount: number) {
    this.lacerations.increaseSeverity(amount);
    if(amount > 30 && this.fracture.severity === 0 && Math.random() < 0.5) {
      this.addFracture();
    }
  }
  addFracture() {
    this.fracture.increaseSeverity(100);
  }

  returnAfflictions() {
    console.log(
      "Bleeding: " + this.bleeding.severity +
      ", Lacerations: \n" +
      this.lacerations.severity +
      ", Fracture: \n" +
      this.fracture.severity
    );
    return [this.bleeding, this.lacerations, this.fracture];
  }
}

export class LeftArm extends Limbs {
  constructor() {
    super();
  }
}
export class RightArm extends Limbs {
  constructor() {
    super();
  }
}

export class LefLeg extends Limbs {
  constructor() {
    super();
  }
}

export class RightLeg extends Limbs {
  constructor() {
    super();
  }
}

export class Head extends Limbs {
  constructor() {
    super();
  }
}

export class Torso extends Limbs {
  constructor() {
    super();
  }
}
