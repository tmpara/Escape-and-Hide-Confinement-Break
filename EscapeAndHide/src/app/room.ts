export class Room {
    width: number;
    height: number;
    entrances: string[];
    layout: string[][];

    constructor(width: number, height: number, entrances: string[], layout: string[][]) {
        this.width = width;
        this.height = height;
        this.entrances = entrances;
        this.layout = layout;
    }
}