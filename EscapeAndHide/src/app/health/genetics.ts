import { trigger } from "@angular/animations";
import { Internals, Liver ,Heart } from "./internals";
import { Limbs } from "./limbs";

export class Genetics {
    maxSlots = 16;
    Internals = new Internals;

    testGene: Gene = new Gene("Test Gene", "This is a test gene that increases blood amount in liver.", "Liver", ["additionalBlood +200"]);
    //testAdvancedGene: AdvancedGene = new AdvancedGene("Test Advanced Gene", "This is a test advanced gene that increases blood regeneration in liver. and gives player 50% burn resistance", "Liver", ["bloodRegen +0.5"], ["burnResistance +0.5"]);

    genes: Gene[] = [];
    geneStorage: Gene[] = []; // This could be used to store genes that the player has collected but not yet activated.

    triggerGeneEffects(gene: Gene, internals: Internals) {
        //console.log(this.genes)
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

        let selectedStat: [string, number][] = [];

        let quality = this.generateRandomNumber(-100,100)/100;

        switch (selectedInternal){
            case "Heart":
                selectedStat.push(["bloodRegen", 5], ["additionalEnergy", 10]);
            break;
            case "Lungs":
                selectedStat.push(["hypoxemiaTolerance", 15], ["additionalEnergy", 10]);
            break;
            case "Brain":
                selectedStat.push(["additionalEnergy", 10], ["additionalSanity", 5], ["additionalAccuracy", 5]);
            break;
            case "Liver":
                selectedStat.push(["additionalBlood", 500], ["bloodRegen", 5]);
            break;


        }
        for (let stat of selectedStat){
            quality = this.generateRandomNumber(-100,100)/100;
            stat[1] = Math.round(stat[1] * (quality));
        }

        let description = `This gene enhances the ${selectedInternal} by providing the following bonuses: ${selectedStat.map(stat => `${stat[0]} ${stat[1]}`).join(", ")}.`;

        return new Gene(`Random ${selectedInternal} Gene`, description, selectedInternal, selectedStat.map(stat => `${stat[0]} ${stat[1]}`));
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


