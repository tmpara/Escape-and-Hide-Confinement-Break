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

                
                
                let leftEntranceRequired = false;
                let upEntranceRequired = false;


                //let roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
                //this.roomsIDs[x][y] = roomID;



                //Check left room entrance compatibility

                if(this.isValidRoom(x-1,y) ){
                    if(this.getRoomEntrances((this.roomsIDs[x-1][y] as keyof RoomsData)).includes("right")){
                        leftEntranceRequired = true;
                        
                    }
                    
                } else{
                    
                }

                

                if(this.isValidRoom(x,y-1) ){
                    if(this.getRoomEntrances((this.roomsIDs[x][y-1] as keyof RoomsData)).includes("down")){
                        upEntranceRequired = true;
                    }
                }

                this.setRoomByEntrance(leftEntranceRequired, upEntranceRequired, x, y);

                
                
                
                
                
              
              
            }
        }
        this.loadRoomWithId(5,5,"startingRoom");
        this.roomsIDs[5][5] = "startingRoom";
        this.loadRoomWithId(5,6,"testRoomUp");
        this.roomsIDs[5][6] = "testRoomUp";
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

    setRoomByEntrance(leftEntranceRequired: boolean, upEntranceRequired: boolean, x:number, y:number){
        let roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
        
        if  (leftEntranceRequired && upEntranceRequired){
            console.log("left and up entrance required at "+x+","+y);
            while(this.getRoomEntrances(roomID as keyof RoomsData).includes("left")==false && this.getRoomEntrances(roomID as keyof RoomsData).includes("up")==false){
                roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
                this.roomsIDs[x][y] = roomID;
                console.log("Searching for room with left and up entrance");
            }
            
        } else if (leftEntranceRequired && !upEntranceRequired){
            console.log("left entrance required and up is forbidden at "+x+","+y);
            while(this.getRoomEntrances(roomID as keyof RoomsData).includes("left")==false && this.getRoomEntrances(roomID as keyof RoomsData).includes("up")==true){
                roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
                this.roomsIDs[x][y] = roomID;
                console.log("Searching for room with left entrance and no up entrance");
            }
        } else if (!leftEntranceRequired && upEntranceRequired){
            console.log("up entrance required and left is forbidden at "+x+","+y);
            while(this.getRoomEntrances(roomID as keyof RoomsData).includes("up")==false && this.getRoomEntrances(roomID as keyof RoomsData).includes("left")==true){
                roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
                this.roomsIDs[x][y] = roomID;
                console.log("Searching for room with up entrance and no left entrance");
            }
        } else {
            console.log("both left and up entrance are forbidden at "+x+","+y);
            while(this.getRoomEntrances(roomID as keyof RoomsData).includes("up")==true && this.getRoomEntrances(roomID as keyof RoomsData).includes("left")==true){
                roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
                this.roomsIDs[x][y] = roomID;
                console.log("Searching for room with no left or up entrance");
            }
        }
        
        console.log("chose entrances: "+ this.getRoomEntrances(roomID as keyof RoomsData) + " for room at "+x+","+y);
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




