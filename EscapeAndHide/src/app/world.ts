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
                let roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
                //if(this.rooms[x-1][y] != null && this.getRoomById(roomID as keyof RoomsData).entrances.includes("left") && this.getRoomById(this.roomsIDs[x-1][y] as keyof RoomsData).entrances.includes("right")){
                //}
                this.loadRoomWithId(x,y,roomID as keyof RoomsData);
            }
        }
        this.loadRoomWithId(5,5,"startingRoom");
        this.loadRoomWithId(5,6,"testRoomUp");
    }

    getRoomById(id: keyof RoomsData){
        return this.data[id] as any;
    }

    loadRoomWithId(worldX:number,worldY:number,id: keyof RoomsData){
        let x = (this.data[id] as any).width;
        let y = (this.data[id] as any).height;
        this.rooms[worldX][worldY] = new GameGrid(x,y);
        this.rooms[worldX][worldY].createEmptyMap();
        this.rooms[worldX][worldY].loadMap((this.data[id] as any).layout);
    }

   
}

