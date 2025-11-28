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

        // choose a single starting room and ending room 
        const startX = 5;
        const startY = 5;
        const endX = 6;
        const endY = 6;
        this.roomsIDs[startX][startY] = "startingRoom";
        this.loadRoomWithId(startX, startY, "startingRoom");

        this.roomsIDs[endX][endY] = "endingRoom";
        this.loadRoomWithId(endX, endY, "endingRoom");

        for(let x=0;x<this.width;x++){
            for(let y=0;y<this.height;y++){
                
                if (x === startX && y === startY) continue;
                if (x === endX && y === endY) continue;
                 
                let leftEntranceRequired = false;
                let upEntranceRequired = false;

                let rightEntranceRequired = 1;
                let downEntranceRequired = 1;




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
                        rightEntranceRequired = 2
                        console.log("right entrance required at "+x+","+y);
                    }
                }

                if (y > 0 && this.roomsIDs[x] && this.roomsIDs[x][y+1]) {
                    const neighborId = this.roomsIDs[x][y+1] as keyof RoomsData;
                    if (this.getRoomEntrances(neighborId).includes("up")) {
                        downEntranceRequired = 2
                        console.log("down entrance required at "+x+","+y);
                    }
                }

              

                
              
                if(y==8){
                    debugger
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
  

setRoomByEntrance(leftEntranceRequired: boolean, upEntranceRequired: boolean, rightEntranceRequired:number, downEntranceRequired:number, x:number, y:number){
        
        let roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
        
        let loopCounter = 0;

        let rightRequired;
        let downRequired;

        let up = this.getRoomEntrances(roomID as keyof RoomsData).includes("up");
        let left = this.getRoomEntrances(roomID as keyof RoomsData).includes("left");
        let right = this.getRoomEntrances(roomID as keyof RoomsData).includes("right");
        let down = this.getRoomEntrances(roomID as keyof RoomsData).includes("down");

        const resetRoomEntrances = () => { 
        up = this.getRoomEntrances(roomID as keyof RoomsData).includes("up");
        left = this.getRoomEntrances(roomID as keyof RoomsData).includes("left");
        right = this.getRoomEntrances(roomID as keyof RoomsData).includes("right");
        down = this.getRoomEntrances(roomID as keyof RoomsData).includes("down");
        }

        const whileFunction = () => {
            loopCounter++;
            if(loopCounter > 50){
                
                roomID = this.data.deadEndRooms[Math.floor(Math.random()*this.data.roomList.length)];
            }else{
                roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
            }
            
            this.roomsIDs[x][y] = roomID;
            resetRoomEntrances();
        }

       

        if(x==this.width-1 ){
                downEntranceRequired = 0;
        }
        if(y==this.height-1){
                rightEntranceRequired = 0;
        }

        if (rightEntranceRequired == 2){rightRequired = true; }
        if (downEntranceRequired == 2) {downRequired = true; }
        if (rightEntranceRequired == 0){rightRequired = false; }
        if (downEntranceRequired == 0) {downRequired = false; }

        if (rightEntranceRequired != 1 || downEntranceRequired != 1 ){
            if (rightEntranceRequired == 1 || downEntranceRequired == 1 ){
                if (rightEntranceRequired == 1){
                    while(up != upEntranceRequired || left != leftEntranceRequired  || down != downRequired ){
                    whileFunction();
                    if(loopCounter>100){
                        roomID = "crossHall1";
                        this.roomsIDs[x][y] = roomID;
                        console.log("Could not find suitable room at "+x+","+y+", setting to noRoom");
                        break;
                    }
                    }
                }
                else{
                    while(up != upEntranceRequired || left != leftEntranceRequired  || right != rightRequired ){
                    whileFunction();
                    if(loopCounter>100){
                        roomID = "crossHall1";
                        this.roomsIDs[x][y] = roomID;
                        console.log("Could not find suitable room at "+x+","+y+", setting to noRoom");
                        break;
                    }
                    }
                }
            }
            else{
                while(up != upEntranceRequired || left != leftEntranceRequired || right != rightRequired || down != downRequired ){
                    whileFunction();
                    if(loopCounter>100){
                        roomID = "crossHall1";
                        this.roomsIDs[x][y] = roomID;
                        console.log("Could not find suitable room at "+x+","+y+", setting to noRoom");
                        break;
                    }
                }
            }

            
        }
        else{
             while(up != upEntranceRequired || left != leftEntranceRequired ){
               whileFunction();
               if(loopCounter>100){
                        roomID = "crossHall1";
                        this.roomsIDs[x][y] = roomID;
                        console.log("Could not find suitable room at "+x+","+y+", setting to noRoom");
                        break;
                    }
               
            }
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
       if(this.data[roomId]==undefined){
        console.log("Room data for "+roomId+" is undefined");
        return [];
       }
        return (this.data[roomId] as any).entrances;
    }

   
}




