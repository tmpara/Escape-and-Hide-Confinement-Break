export class Health{
    maxHealth: number;
    currentHealth: number;
    Dot: number;
    Regeneration: number = 0.05; //base 50ml, how much health is regenerated each turn
    DotReduceRate: number = 4; //base 25%, how much the dot effect reduces each turn
    DotDamageRate: number = 4; //base 25%, how much damage the dot effect does each turn

    constructor(maxHealth: number, currentHealth: number){
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
        this.Dot = 0;
    }

    Damage(Damage: number, addDot: number = 0){
        this.currentHealth -= Damage;
        this.Dot += addDot;

    }
    
    TriggerDot(){
        if(this.Dot > 0){
            this.currentHealth = this.currentHealth - this.Dot/this.DotDamageRate;
            this.Dot = this.Dot/this.DotReduceRate;
            if(this.Dot <= this.Regeneration){
                this.Dot = 0;
            }else{
                this.Dot -= this.Regeneration;
            }

        }else{
            if(this.currentHealth + this.Regeneration < this.maxHealth){
            this.currentHealth += this.Regeneration;
            }else{
                this.currentHealth = this.maxHealth;
            }
        }
    }
    


}