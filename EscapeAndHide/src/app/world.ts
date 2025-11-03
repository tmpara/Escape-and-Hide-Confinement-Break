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
                


                let roomID = this.data.actualRoomList[Math.floor(Math.random()*this.data.actualRoomList.length)];
                this.roomsIDs[x][y] = roomID;
                
                if(this.isValidRoom(x-1,y) ){
                  //  let leftRoom = this.getRoomById(this.roomsIDs[x-1][y] as keyof RoomsData);
                    if(this.getRoomEntrances((this.roomsIDs[x-1][y] as keyof RoomsData)).includes("right")){
                        console.log(this.roomsIDs[x-1][y]+" has right entrance !!!left " + (x-1)+","+y);
                        if(this.getRoomEntrances(roomID as keyof RoomsData).includes("left")){
                            console.log(roomID+ " has left entrance"  +x+","+y);
                            this.loadRoomWithId(x,y,roomID as keyof RoomsData);
                        
                        } 
                        else{
                            console.log(roomID + " does not have left entrance,starting change " +x+","+y);
                            while(!this.getRoomEntrances(roomID as keyof RoomsData).includes("left")){
                                roomID = this.data.actualRoomList[Math.floor(Math.random()*this.data.actualRoomList.length)];
                                this.roomsIDs[x][y] = roomID;
                                console.log("1:Changed roomID to "+roomID + " at "+x+","+y);
                            }
                            console.log("Now "+roomID+ " does have left entrance" +x+","+y);
                            this.loadRoomWithId(x,y,roomID as keyof RoomsData);
                        }
                    }
                    else{
                        console.log(this.roomsIDs[x-1][y]+" does not have right entrance !!!left" + (x-1)+","+y);
                        if(this.getRoomEntrances(roomID as keyof RoomsData).includes("left")){
                            console.log(roomID+ " has left entrance,starting change" +x+","+y);
                            while(this.getRoomEntrances(roomID as keyof RoomsData).includes("left")){
                                roomID = this.data.actualRoomList[Math.floor(Math.random()*this.data.actualRoomList.length)];
                                this.roomsIDs[x][y] = roomID;
                                console.log("2:Changed roomID to "+roomID + " at "+x+","+y);
                                
                            }
                            console.log("Now "+roomID+ " does not have left entrance" +x+","+y );
                        }
                    }
                    this.loadRoomWithId(x,y,roomID as keyof RoomsData);
                }
                else{
                   // console.log("room not valid");
                    this.loadRoomWithId(x,y,roomID as keyof RoomsData);
                }
                
                
                
              
              console.log("Loaded room "+roomID + " at "+x+","+y);
            }
        }



        this.loadRoomWithId(5,5,"startingRoom");

        this.loadRoomWithId(5,6,"testRoomUp");

        //this.loadRoomWithId(6,5,"verticalHall");
    
        
            

    }

    isValidRoom(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return false;
    } else {
      return true;
    }
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




