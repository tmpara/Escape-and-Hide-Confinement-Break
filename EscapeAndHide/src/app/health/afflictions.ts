export class Afflcition {
  name = ' ';
  maxSeverity = 100;
  severity = 0;
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
  override name = 'Bleeding';
  override maxSeverity: number = 100;
  constructor() {
    super();
  }
  naturalHeal(amount: number) {
    this.decreaseSeverity(amount);
  }
}

export class Bloodloss extends Afflcition {
  override name = 'Bloodloss';
  override maxSeverity: number = 100;
  constructor() {
    super();
  }
}

export class Lacerations extends Afflcition {
  override name = 'Lacerations';
  constructor() {
    super();
  }
}

export class Fracture extends Afflcition {
  override name = 'Fracture';
  constructor() {
    super();
  }
}

export class Burn extends Afflcition {
  override name = 'Burn';
  constructor() {
    super();
  }
}

export class GunshotWound extends Afflcition {
  override name = 'GunshotWound';
  constructor() {
    super();
  }
}

export class Zapped extends Afflcition {
  override name = 'Zapped';
  constructor() {
    super();
  }
}
