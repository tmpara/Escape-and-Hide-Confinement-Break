import { GameGrid } from "./grid";
import { RoomsData } from "./rooms";

export class World {
    rooms: GameGrid[][];
    roomsIDs: string[][];
    width: number;
    height: number;
    data: RoomsData = new RoomsData();
    
    constructor() {
        this.rooms = new Array();
        this.roomsIDs = new Array();
        this.width = 10;
        this.height = 10;

    }

    CreateWorld(){
        for(let x=0;x<this.width;x++){
            this.rooms[x] = new Array();
            this.roomsIDs[x] = new Array();
            for(let y=0;y<this.height;y++){
                
              //  this.roomsIDs[x][y] = this.data.roomList[Math.floor(Math.random() * this.data.roomList.length)];
            }
        }

        this.rooms[5][5] = new GameGrid(9,9);
        this.rooms[5][5].CreateEmptyMap();
        this.rooms[5][5].LoadMap(9,9,this.data.startingRoom);

        this.rooms[5][6] = new GameGrid(11,11);
        this.rooms[5][6].CreateEmptyMap();
        this.rooms[5][6].LoadMap(11,11,this.data.testRoomUp);
            

    }
}

