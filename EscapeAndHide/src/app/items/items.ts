export class Items {
  gun = new Weapon(
    'gun',
    'weapon',
    false,
    '/sprites/items/gun.png',
    null,
    50,
    5
  );
  bigGun = new Weapon(
    'bigGun',
    'weapon',
    false,
    '/sprites/items/biggun.png',
    null,
    100,
    7
  );
  bandage = new Healing(
    'bandage',
    'consumable',
    false,
    '/sprites/items/bandage.png',
    null,
    0.5
  );
  medkit = new Healing(
    'medkit',
    'consumable',
    false,
    '/sprites/items/medkit.png',
    null,
    1.0
  );
  helmet = new Armor(
    'helmet',
    'armor',
    false,
    'placeholder.png',
    null,
    2,
    'head'
  );
  bodyArmor = new Armor(
    'bodyArmor',
    'armor',
    false,
    'placeholder.png',
    null,
    5,
    'body'
  );
}

export class Item {
  name: string;
  category: string;
  displayed: boolean;
  sprite: string;
  isEquipped: boolean = false;
  constructor(
    name: string,
    category: string,
    displayed: boolean,
    sprite: string
  ) {
    this.name = name;
    this.displayed = displayed;
    this.category = category;
    this.sprite = sprite;
  }
}

export class Weapon extends Item {
  damage: number;
  range: number;
  constructor(
    name: string,
    category: string,
    displayed: boolean,
    sprite: string,
    equippedSprite: string | null,
    damage: number,
    range: number
  ) {
    super(name, category, displayed, sprite);
    this.damage = damage;
    this.range = range;
  }
}

export class Healing extends Item {
  bleedingHeal: number;
  constructor(
    name: string,
    category: string,
    displayed: boolean,
    sprite: string,
    equippedSprite: string | null,
    bleedingHeal: number
  ) {
    super(name, category, displayed, sprite);
    this.bleedingHeal = bleedingHeal;
  }
}

export class Armor extends Item {
  defense: number;
  slot: string;
  constructor(
    name: string,
    category: string,
    displayed: boolean,
    sprite: string,
    equippedSprite: string | null,
    defense: number,
    slot: string
  ) {
    super(name, category, displayed, sprite);
    this.defense = defense;
    this.slot = slot;
  }
}
