import * as PIXI from 'pixi.js';
export class Tile {
    name: string;
    hasCollision: boolean;
    effect: string;
    destroyable: boolean;
    health: number;
    gridX:number;
    gridY:number;
    sprite: PIXI.Graphics;
    //contains?: string; //placeholder for object

    constructor(name: String, hasCollision: boolean, effect: string, destroyable: boolean, health: number,){
        this.name = ""
        this.hasCollision = hasCollision
        this.effect = effect
        this.destroyable = destroyable
        this.health = health
        this.gridX = 0
        this.gridY = 0
        this.sprite = new PIXI.Graphics();
        this.sprite.beginFill(0xff0000); // red
        this.sprite.drawRect(0, 0, 32, 32);
        this.sprite.endFill();
        this.sprite._zIndex = 0.5;
    }

    spawn(x:number, y:number): void {
        this.gridX = x;
        this.gridY = y;
        this.updatePosition();
    }

    updatePosition(): void {
        this.sprite.x = this.gridX * 32;
        this.sprite.y = this.gridY * 32;
    }

    setGridPosition(x: number, y: number): void {
        this.gridX = x;
        this.gridY = y;
        this.updatePosition();
    }
}