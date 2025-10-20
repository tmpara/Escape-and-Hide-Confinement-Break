export class Energy{
    maxEnergy: number;
    currentEnergy: number;

    constructor(maxEnergy: number, currentEnergy: number){
        this.maxEnergy = maxEnergy;
        this.currentEnergy = currentEnergy;
    }

    loseEnergy(Amount: number){
        this.currentEnergy -= Amount;
        if(this.currentEnergy < 0){
            this.currentEnergy = 0
        }
    }

    addEnergy(Amount: number){
        this.currentEnergy += Amount;
        if(this.currentEnergy > this.maxEnergy){
            this.currentEnergy = this.maxEnergy
        }
    }

    setEnergy(Amount: number){
        this.currentEnergy = Amount;
    }

}