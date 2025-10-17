export class Health{
    maxHealth: number;
    currentHealth: number;
    Dot: number;
    Regeneration: number = 0.05; //base 50ml, how much health is regenerated each turn
    DotReduceRate: number = 0.25; //base 25%, how much the dot effect reduces each turn
    DotDamageRate: number = 0.25; //base 25%, how much damage the dot effect does each turn

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
            console.log("DOT start " +   this.Dot);
            this.currentHealth = this.currentHealth - this.Dot*this.DotDamageRate;
            console.log("DOT damage " +   this.Dot*this.DotDamageRate);
            this.Dot = this.Dot - this.Dot*this.DotReduceRate;
            console.log("DOT end " +   this.Dot);
            if (this.Regeneration > 0){
              if(this.Dot <= this.Regeneration ){
                this.Dot = 0;
             }else{
                this.Dot -= this.Regeneration;
             }
            }else{
               if(this.Dot <= 0.05 ){
                this.currentHealth = this.currentHealth - this.Dot
                this.Dot = 0;
               }
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