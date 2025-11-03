import { Room } from "./room";

export class RoomsData {
    roomList: string[] = [
        "starting_room",
        "laboratory_room1", 
        "office_room1", 
        "hallway_room1",
        "storage_room1", 
        "security_room1",
        "cafeteria_room1",
        "laboratory_room_destroyed1",
        "office_room_destroyed1", 
        "hallway_room_destroyed1",
        "storage_room_destroyed1", 
        "security_room_destroyed1",
        "cafeteria_room_destroyed1",
    ];
    startingRoom: Room;
    testRoomUp: Room;
    verticalHall: Room;
    horizontalHall: Room;
    cornerRoom: Room;
    cornerRoomInverted: Room;
    
    actualRoomList: string[] = [
        "startingRoom",
        "testRoomUp",
        "verticalHall",
       "horizontalHall",
         "cornerRoom",
        "cornerRoomInverted",
    ]

    constructor() {
        this.startingRoom = new Room(9, 9, ["up", "left", "right", "down"], []);
        this.startingRoom.layout = Array.from({ length: this.startingRoom.height }, () => Array.from({ length: this.startingRoom.width }, () => "floor_basic"));
        this.startingRoom.layout[0][0] = "floor_basic";
        this.startingRoom.layout[0][4] = "room_entrance";
        this.startingRoom.layout[4][0] = "room_entrance";
        this.startingRoom.layout[4][8] = "room_entrance";
        this.startingRoom.layout[8][4] = "room_entrance";
        
        this.testRoomUp = new Room(11, 11, ["up", "left", "right", "down"], []);
        this.testRoomUp.layout = Array.from({ length: this.testRoomUp.height }, () => Array.from({ length: this.testRoomUp.width }, () => "floor_basic"));
        this.testRoomUp.layout[0][5] = "room_entrance";
        this.testRoomUp.layout[5][0] = "room_entrance";
        this.testRoomUp.layout[5][10] = "room_entrance";
        this.testRoomUp.layout[10][5] = "room_entrance";

        this.verticalHall = new Room(5, 15, ["up", "down"], []);
        this.verticalHall.layout = Array.from({ length: this.verticalHall.width }, () => Array.from({ length: this.verticalHall.height }, () => "floor_basic"));
        this.verticalHall.layout[2][0] = "room_entrance";
        this.verticalHall.layout[2][14] = "room_entrance";

        this.horizontalHall = new Room(15, 5, ["left", "right"], []);   
        this.horizontalHall.layout = Array.from({ length: this.horizontalHall.width }, () => Array.from({ length: this.horizontalHall.height }, () => "floor_basic"));
        this.horizontalHall.layout[0][2] = "room_entrance";
        this.horizontalHall.layout[14][2] = "room_entrance"; 
        
        this.cornerRoom = new Room(7, 7, ["left", "up"], []);
        this.cornerRoom.layout = Array.from({ length: this.cornerRoom.height }, () => Array.from({ length: this.cornerRoom.width }, () => "floor_basic"));
        this.cornerRoom.layout[0][3] = "room_entrance";
        this.cornerRoom.layout[3][0] = "room_entrance";

        this.cornerRoomInverted = new Room(7, 7, ["right", "down"], []); 
        this.cornerRoomInverted.layout = Array.from({ length: this.cornerRoomInverted.height }, () => Array.from({ length: this.cornerRoomInverted.width }, () => "floor_basic"));
        this.cornerRoomInverted.layout[3][6] = "room_entrance";
        this.cornerRoomInverted.layout[6][3] = "room_entrance";
    }
 
    
}