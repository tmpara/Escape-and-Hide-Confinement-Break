export class RoomsData {
    roomList: string[] = ["starting_room", "laboratory_room", "office_room", "hallway_room","storage_room", "security_room", "cafeteria_room", "laboratory_room_destroyed", "office_room_destroyed", "hallway_room_destroyed","storage_room_destroyed", "security_room_destroyed", "cafeteria_room_destroyed"];
    startingRoom: string[][];

    constructor() {
        this.startingRoom = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => "floor_basic"));
        this.startingRoom[3][4] = "room_entrance";
        this.startingRoom[4][3] = "room_entrance";
        this.startingRoom[5][4] = "room_entrance";
        this.startingRoom[4][5] = "room_entrance";
    }

    
}