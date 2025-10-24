export class RoomsData {
    roomList: string[] = ["starting_room", "laboratory_room", "office_room", "hallway_room","storage_room", "security_room", "cafeteria_room", "laboratory_room_destroyed", "office_room_destroyed", "hallway_room_destroyed","storage_room_destroyed", "security_room_destroyed", "cafeteria_room_destroyed"];
    startingRoom: string[][];
    testRoomUp: string[][];
    //testRoomDown: string[][]

    constructor() {

        this.startingRoom = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => "floor_basic"));
        this.startingRoom[0][0] = "floor_basic";
        this.startingRoom[0][4] = "room_entrance";
        this.startingRoom[4][0] = "room_entrance";
        this.startingRoom[4][8] = "room_entrance";
        this.startingRoom[8][4] = "room_entrance";
        

        this.testRoomUp = Array.from({ length: 11 }, () => Array.from({ length: 11 }, () => "floor_basic"));
        this.testRoomUp[0][5] = "room_entrance";
        this.testRoomUp[5][0] = "room_entrance";
        this.testRoomUp[5][10] = "room_entrance";
        this.testRoomUp[10][5] = "room_entrance";


    }

    
}