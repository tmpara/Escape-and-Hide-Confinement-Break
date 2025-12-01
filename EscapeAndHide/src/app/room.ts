import { Entity } from "./entity";

export class Room {
    width: number;
    height: number;
    entrances: string[];
    layout: Entity[][] | string;

    constructor(width: number, height: number, entrances: string[], layout: Entity[][]) {
        this.width = width;
        this.height = height;
        this.entrances = entrances;
        this.layout = layout;
    }
}