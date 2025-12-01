import { GameGrid } from "./grid";
import { RoomsData } from "./rooms";

export class World {
    rooms: GameGrid[][];
    roomsIDs: string[][];
    width: number;
    height: number;
    data: RoomsData = new RoomsData();
    startX: number = 0;
    startY: number = 0;
    endX: number = 0;
    endY: number = 0;
    
    constructor() {
        this.rooms = new Array();
        this.roomsIDs = new Array();
        this.width = 10;
        this.height = 10;
        this.startX = Math.floor((Math.random() * 8) + 1);
        this.startY = Math.floor((Math.random() * 8) + 1);
        this.endX = Math.floor((Math.random() * 8) + 1);
        this.endY = Math.floor((Math.random() * 8) + 1);
    }

    CreateWorld(){
         // ensure arrays exist for every column
        for(let x=0;x<this.width;x++){
            this.rooms[x] = new Array();
            this.roomsIDs[x] = new Array();
        }

        // choose a single starting room and ending room 
        this.roomsIDs[this.startX][this.startY] = "startingRoom";
        this.loadRoomWithId(this.startX, this.startY, "startingRoom");

        this.roomsIDs[this.endX][this.endY] = "endingRoom";
        this.loadRoomWithId(this.endX, this.endY, "endingRoom");

        for(let x=0;x<this.width;x++){
            for(let y=0;y<this.height;y++){
                
                if (x === this.startX && y === this.startY) continue;
                if (x === this.endX && y === this.endY) continue;
                 
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
  
   pathFind(fromX:number, fromY:number, toX:number, toY:number): boolean {
    // bounds / existence checks
    if (!this.isValidRoom(fromX, fromY) || !this.isValidRoom(toX, toY)) return false;
    const startId = this.roomsIDs[fromX][fromY];
    const targetId = this.roomsIDs[toX][toY];
    if (!startId || !targetId) return false;

    // simple BFS across world cells using mutual entrances (room -> neighbor and neighbor -> room)
    const visited: boolean[][] = Array.from({ length: this.width }, () => Array(this.height).fill(false));
    const queue: Array<[number, number]> = [];
    queue.push([fromX, fromY]);
    visited[fromX][fromY] = true;

    const opposite = (dir: string) => {
      if (dir === "left") return "right";
      if (dir === "right") return "left";
      if (dir === "up") return "down";
      if (dir === "down") return "up";
      return "";
    };

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;

      if (cx === toX && cy === toY) return true;

      const roomId = this.roomsIDs[cx]![cy] as keyof RoomsData;
      const entrances = this.getRoomEntrances(roomId) || [];

      for (const dir of entrances) {
        let nx = cx;
        let ny = cy;
        if (dir === "left") nx = cx - 1;
        else if (dir === "right") nx = cx + 1;
        else if (dir === "up") ny = cy - 1;
        else if (dir === "down") ny = cy + 1;

        if (!this.isValidRoom(nx, ny)) continue;
        const neighborId = this.roomsIDs[nx]![ny];
        if (!neighborId) continue;

        // require neighbor to have the opposite entrance
        const neighborEntrances = this.getRoomEntrances(neighborId as keyof RoomsData) || [];
        if (!neighborEntrances.includes(opposite(dir))) continue;

        if (!visited[nx][ny]) {
          visited[nx][ny] = true;
          queue.push([nx, ny]);
        }
      }
    }

    return false;
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
            if(loopCounter > 100){
                roomID = "crossHall1";
                this.roomsIDs[x][y] = roomID;
                console.log("Could not find suitable room at "+x+","+y+", setting to noRoom");
                return true;
            }
            else if(loopCounter > 50){
                roomID = this.data.deadEndRooms[Math.floor(Math.random()*this.data.deadEndRooms.length)];
            }else{
                roomID = this.data.roomList[Math.floor(Math.random()*this.data.roomList.length)];
            }
            
            
            this.roomsIDs[x][y] = roomID;
            resetRoomEntrances();
            return false;
        }

       

        if(x==this.width-1 ){
                rightEntranceRequired = 0;
                console.log("No right entrance required at "+x+","+y);
        }
        if(y==this.height-1){
                downEntranceRequired = 0;
                console.log("No down entrance required at "+x+","+y);
        }

        if (rightEntranceRequired == 2){rightRequired = true; }
        if (downEntranceRequired == 2) {downRequired = true; }
        if (rightEntranceRequired == 0){rightRequired = false; }
        if (downEntranceRequired == 0) {downRequired = false; }

        if (rightEntranceRequired != 1 || downEntranceRequired != 1 ){
            if (rightEntranceRequired == 1 || downEntranceRequired == 1 ){
                if (rightEntranceRequired == 1){
                    while(up != upEntranceRequired || left != leftEntranceRequired  || down != downRequired ){
                    if(whileFunction()) {break;}
                    }
                }
                else{
                    while(up != upEntranceRequired || left != leftEntranceRequired  || right != rightRequired ){
                    if(whileFunction()) {break;}
                    }
                }
            }
            else{
                while(up != upEntranceRequired || left != leftEntranceRequired || right != rightRequired || down != downRequired ){
                    if(whileFunction()) {break;}
                }
            }
        }
        else{
             while(up != upEntranceRequired || left != leftEntranceRequired ){
               if(whileFunction()) {break;}
               
            }
        }
        
        
        this.roomsIDs[x][y] = roomID;
        this.loadRoomWithId(x,y,roomID as keyof RoomsData);

    }

    getRoomById(id: keyof RoomsData){
        return this.data[id] as any;
    }

    loadRoomWithId(worldX:number,worldY:number,id: keyof RoomsData){
        if(this.data[id]==undefined){
            debugger
        }
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




