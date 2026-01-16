export class Afflcition {
  maxSeverity: number = 100;
  severity: number = 0;
  constructor() {}
  increaseSeverity(amount: number) {
    if (this.severity + amount > this.maxSeverity) {
      this.severity = this.maxSeverity;
    } else {
      this.severity += amount;
    }
    1;
  }
  decreaseSeverity(amount: number) {
    if (this.severity - amount < 0) {
      this.severity = 0;
    } else {
      this.severity -= amount;
    }
  }
}

export class Hypoxemia extends Afflcition {
  constructor() {
    super();
  }
}

export class Bleeding extends Afflcition {
  name: string = 'Bleeding';
  override maxSeverity: number = 100;
  constructor() {
    super();
  }
  naturalHeal(amount: number) {
    this.decreaseSeverity(amount);
  }
}

export class Bloodloss extends Afflcition {
  name: string = 'Bloodloss';
  override maxSeverity: number = 500;
  constructor() {
    super();
  }
}

export class Lacerations extends Afflcition {
  name: string = 'Lacerations';
  constructor() {
    super();
  }
}

export class Fracture extends Afflcition {
  name: string = 'Fracture';
  constructor() {
    super();
  }
}
