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
         // ensure arrays exist for every column
        for(let x=0;x<this.width;x++){
            this.rooms[x] = new Array();
            this.roomsIDs[x] = new Array();
        }

        // choose a single starting room (center by default)
        const startX = 5;
        const startY = 5;
        this.roomsIDs[startX][startY] = "startingRoom";
        this.loadRoomWithId(startX, startY, "startingRoom");

        for(let x=0;x<this.width;x++){
            for(let y=0;y<this.height;y++){
                
                if (x === startX && y === startY) continue;
                 
                let leftEntranceRequired = false;
                let upEntranceRequired = false;

                let rightEntranceRequired = false;
                let downEntranceRequired = false;



                //let roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
                //this.roomsIDs[x][y] = roomID;



                //Check room entrance compatibility

                if(this.isValidRoom(x-1,y) ){
                    if(this.getRoomEntrances((this.roomsIDs[x-1][y] as keyof RoomsData)).includes("right")){
                        leftEntranceRequired = true;
                        
                    }
                    
                } 

                if(this.isValidRoom(x,y-1) ){
                    if(this.getRoomEntrances((this.roomsIDs[x][y-1] as keyof RoomsData)).includes("down")){
                        upEntranceRequired = true;
                    }
                }

                if (x > 0 && this.roomsIDs[x+1] && this.roomsIDs[x+1][y]) {
                    const neighborId = this.roomsIDs[x+1][y] as keyof RoomsData;
                    if (this.getRoomEntrances(neighborId).includes("left")) {
                        rightEntranceRequired = true;
                        console.log("right entrance required at "+x+","+y);
                    }
                }

                if (y > 0 && this.roomsIDs[x] && this.roomsIDs[x][y+1]) {
                    const neighborId = this.roomsIDs[x][y+1] as keyof RoomsData;
                    if (this.getRoomEntrances(neighborId).includes("up")) {
                        downEntranceRequired = true;
                        console.log("down entrance required at "+x+","+y);
                    }
                }

              

                
              
                
                this.setRoomByEntrance(leftEntranceRequired, upEntranceRequired, rightEntranceRequired, downEntranceRequired, x, y);
            }
        }
      
       console.log("World created:");
       console.log(this.roomsIDs);
    }

    isValidRoom(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return false;
    } else {
        if(this.roomsIDs[x][y]==undefined){
            console.log("Room at "+x+","+y+" is undefined");
            return false;
            
        }
      return true;
    }
  }
  

setRoomByEntrance(leftEntranceRequired: boolean, upEntranceRequired: boolean, rightEntranceRequired:boolean, downEntranceRequired:boolean, x:number, y:number){
        let roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
      
        while(this.getRoomEntrances(roomID as keyof RoomsData).includes("up")!=upEntranceRequired || this.getRoomEntrances(roomID as keyof RoomsData).includes("left") != leftEntranceRequired  ){
                roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
                this.roomsIDs[x][y] = roomID;
            }
        
        
        this.roomsIDs[x][y] = roomID;
        this.loadRoomWithId(x,y,roomID as keyof RoomsData);

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

    getRoomEntrances(roomId: keyof RoomsData){
       // console.log((this.data[roomId] as any).entrances);
        return (this.data[roomId] as any).entrances;
    }

   
}




