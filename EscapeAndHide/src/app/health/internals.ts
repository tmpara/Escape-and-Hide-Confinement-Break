export class Internals{
    durability: number = 100;
    bloodRegen: number = 0;
    additionalEnergy: number = 0;
    additionalBlood: number = 0;
    hypoxemiaTolerance: number = 0; // % of resistance to hypoxemia, which is caused by low blood levels. If this reaches 100%, the character becomes immune to hypoxemia and its effects.
    additionalSanity: number = 0;
    additionalAccuracy: number = 0;
}
//Each internal has a list of stats that it modifies, and a durability that can be damaged by certain afflictions.
export class Heart extends Internals {
    override bloodRegen = 0;
    override additionalEnergy = 0;
}

export class Lungs extends Internals {
    override hypoxemiaTolerance = 0;
    override additionalEnergy = 0;
}

export class Brain extends Internals {
    override additionalEnergy = 0;
    override additionalSanity = 0;
    override additionalAccuracy = 0;
}

export class Liver extends Internals{
    override additionalBlood = 0;
    override bloodRegen = 0;

}

