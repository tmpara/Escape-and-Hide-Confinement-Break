import { trigger } from "@angular/animations";
import { Internals, Liver ,Heart } from "./internals";
import { Limbs } from "./limbs";

export class Genetics {
    maxSlots = 16;
    Internals = new Internals;

    testGene: Gene = new Gene("Test Gene", "This is a test gene that increases blood amount in liver.", "Liver", ["additionalBlood +200"]);
    //testAdvancedGene: AdvancedGene = new AdvancedGene("Test Advanced Gene", "This is a test advanced gene that increases blood regeneration in liver. and gives player 50% burn resistance", "Liver", ["bloodRegen +0.5"], ["burnResistance +0.5"]);

    genes: Gene[] = [this.testGene];
    geneStorage: Gene[] = []; // This could be used to store genes that the player has collected but not yet activated.

    triggerGeneEffects(gene: Gene, internals: Internals) {
        // Only apply a gene once.
        if (gene.applied) return;

        // If the gene targets a specific internal (e.g. "Liver"), only apply
        // when the provided internals object matches that target by constructor name.

        // Check if the gene is advanced gene and apply additional effects if so
        if (gene instanceof AdvancedGene) {
            for (let effect of gene.additionalEffects) {
                const [key, value] = effect.split(" ");
                if (key in internals) { //right now doesnt work, should refer to player stats instead of internals
                    (internals as any)[key] += parseInt(value);
                }
            }
        }

        if (gene.targetInternal && internals.constructor.name !== gene.targetInternal) return;

        for (let stat of gene.stats) {
            const [key, value] = stat.split(" ");
            if (key in internals) {
                (internals as any)[key] += parseInt(value);
            }
        }

    

        // Mark as applied so the effect isn't added repeatedly on each update.
        gene.applied = true;
    }
    
    generateRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    generateRandomGene(){

        let selectedInternal = this.Internals.elements[this.generateRandomNumber(0,this.Internals.elements.length-1)]

        let possibleStat:[[String],[Number]];

        switch (selectedInternal){
            case "Heart":
               // possibleStat =
            break;
            case "Lungs":
              //  possibleStat = ["hypoxemiaTolerance","additionalEnergy"]
            break;
            case "Brain":
              //  possibleStat = ["additionalEnergy","additionalSanity","additionalAccuracy"]
            break;
            case "Liver":
              //  possibleStat = ["additionalBlood","bloodRegen"]
            break;
        }

        let selectedStat 

        let description

        let value
    }

}


export class Gene{
    name: string;
    description: string;
    targetInternal: string | null;
    // whether this gene's one-time effects have been applied
    applied: boolean = false;
    stats: string[]; 

    constructor(name: string, description: string, target: string | null, stats: string[]) {
        this.name = name;
        this.description = description;
        this.targetInternal = target;
        this.stats = stats;
    }
}

export class AdvancedGene extends Gene{
    // Advanced genes could have more complex effects, but for now they just inherit from Gene.
    additionalEffects: string[];
    constructor(name: string, description: string, target: string | null, stats: string[], additionalEffects: string[]) {
        super(name, description, target, stats);
        this.additionalEffects = additionalEffects;
    }

    
}


