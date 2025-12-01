export class Limbs {
  afflictionLimit: number = 100;
  bleeding: number = 0;
  lacerations: number = 0;
  fracture: number = 0;

  constructor() {}

  addBleeding(amount: number) {
    if (this.bleeding + amount > this.afflictionLimit) {
      this.bleeding = this.afflictionLimit;
    } else {
      this.bleeding += amount;
    }
  }

  healBleeding() {
    if (this.bleeding > 0 && this.bleeding <= this.afflictionLimit) {
      this.bleeding -= 1;
    }
  }

  addFracture() {
    if (this.fracture < this.afflictionLimit) {
      this.fracture = 100;
    }
  }

  healFracture() {
    if (this.fracture > 0 && this.fracture <= this.afflictionLimit) {
      this.fracture -= 1;
    }
  }

  addLaceration(amount: number) {
    if (this.lacerations + amount > this.afflictionLimit) {
      this.lacerations = this.afflictionLimit;
    } else {
      this.lacerations += amount;
    }
  }

  healLaceration() {
    if (this.lacerations > 0) {
      this.lacerations -= 1;
    }
  }

  naturalHeal() {
    this.healBleeding();
    this.healLaceration();
  }

  returnAfflictions() {
    console.log(
      `Bleeding: ${this.bleeding}, Lacerations: ${this.lacerations}, Fracture: ${this.fracture}`
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
