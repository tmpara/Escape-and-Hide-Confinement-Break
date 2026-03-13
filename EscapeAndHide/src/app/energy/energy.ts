import { GameController } from '../game.controller';
export class Energy{
    maxEnergy: number;
    currentEnergy: number;
    gameController = GameController;

    constructor(maxEnergy: number, currentEnergy: number){
        this.maxEnergy = maxEnergy;
        this.currentEnergy = currentEnergy;
    }

    loseEnergy(Amount: number){
        this.currentEnergy -= Amount;
        if(this.currentEnergy < 0){
            this.currentEnergy = 0
        }
        this.gameController.current?.setEnergyBarFlag(true);
    }

    addEnergy(Amount: number){
        this.currentEnergy += Amount;
        if(this.currentEnergy > this.maxEnergy){
            this.currentEnergy = this.maxEnergy
        }
        this.gameController.current?.setEnergyBarFlag(true);
    }

    setEnergy(Amount: number){
        this.currentEnergy = Amount;
        this.gameController.current?.setEnergyBarFlag(true);
    }

}