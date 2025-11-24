import { Room } from "./room";

export class RoomsData {

    startingRoom: Room;
    testRoomUp: Room;
    crossHall1: Room;
    verticalHall: Room;
    horizontalHall: Room;
    cornerRoom: Room;
    cornerRoomInverted: Room;
    cornerRoomMirrored: Room;
    cornerRoomInvertedMirrored: Room;
    TRoom: Room;
    TRoomInverted: Room;
    DeadEndRoomUp: Room;
    DeadEndRoomDown: Room;
    DeadEndRoomLeft: Room
    DeadEndRoomRight: Room;
    
    roomList: string[] = [
        "startingRoom",
        "testRoomUp",
        "crossHall1",
        "verticalHall",
       "horizontalHall",
         "cornerRoom",
        "cornerRoomInverted",
        "cornerRoomMirrored",
        "cornerRoomInvertedMirrored",
        "TRoom",
        "TRoomInverted",
      

    ]

    deadEndRooms: string[] = [
        "DeadEndRoomUp",
        "DeadEndRoomDown",
        "DeadEndRoomLeft",
        "DeadEndRoomRight"
    ];

    constructor() {
        this.startingRoom = new Room(9, 9, ["up", "left", "right", "down"], []);
        this.startingRoom.layout = Array.from({ length: this.startingRoom.height }, () => Array.from({ length: this.startingRoom.width }, () => "floor_basic"));
        this.startingRoom.layout[0][0] = "floor_basic";
        this.startingRoom.layout[0][6] = "room_entrance_left"; // left entrance
        this.startingRoom.layout[4][0] = "room_entrance_up"; // up entrance
        this.startingRoom.layout[4][8] = "room_entrance_down"; // down entrance
        this.startingRoom.layout[8][4] = "room_entrance_right"; // right entrance
        
        this.testRoomUp = new Room(15, 15, ["up", "left", "right", "down"], []);
        this.testRoomUp.layout = Array.from({ length: this.testRoomUp.height }, () => Array.from({ length: this.testRoomUp.width }, () => "floor_basic"));
        this.testRoomUp.layout[0][7] = "room_entrance_left";
        this.testRoomUp.layout[7][0] = "room_entrance_up";
        this.testRoomUp.layout[7][14] = "room_entrance_down";
        this.testRoomUp.layout[14][7] = "room_entrance_right";

        this.crossHall1 = new Room(15, 15, ["up", "left", "right", "down"], []);
        this.crossHall1.layout = Array.from({ length: this.crossHall1.height }, () => Array.from({ length: this.crossHall1.width }, () => "floor_basic"));
        this.crossHall1.layout[0][7] = "room_entrance_left";
        this.crossHall1.layout[7][0] = "room_entrance_up";
        this.crossHall1.layout[7][14] = "room_entrance_down";
        this.crossHall1.layout[14][7] = "room_entrance_right";

        this.verticalHall = new Room(5, 15, ["up", "down"], []);
        this.verticalHall.layout = Array.from({ length: this.verticalHall.width }, () => Array.from({ length: this.verticalHall.height }, () => "floor_basic"));
        this.verticalHall.layout[2][0] = "room_entrance_up";
        this.verticalHall.layout[2][14] = "room_entrance_down";

        this.horizontalHall = new Room(15, 5, ["left", "right"], []);   
        this.horizontalHall.layout = Array.from({ length: this.horizontalHall.width }, () => Array.from({ length: this.horizontalHall.height }, () => "floor_basic"));
        this.horizontalHall.layout[0][2] = "room_entrance_left";
        this.horizontalHall.layout[14][2] = "room_entrance_right"; 
        
        this.cornerRoom = new Room(7, 7, ["left", "up"], []);
        this.cornerRoom.layout = Array.from({ length: this.cornerRoom.height }, () => Array.from({ length: this.cornerRoom.width }, () => "floor_basic"));
        this.cornerRoom.layout[0][3] = "room_entrance_left"; 
        this.cornerRoom.layout[3][0] = "room_entrance_up"; 

        this.cornerRoomInverted = new Room(7, 7, ["right", "down"], []); 
        this.cornerRoomInverted.layout = Array.from({ length: this.cornerRoomInverted.height }, () => Array.from({ length: this.cornerRoomInverted.width }, () => "floor_basic"));
        this.cornerRoomInverted.layout[3][6] = "room_entrance_down"; 
        this.cornerRoomInverted.layout[6][3] = "room_entrance_right"; 

        this.cornerRoomMirrored = new Room(7, 7, ["right", "up"], []);
        this.cornerRoomMirrored.layout = Array.from({ length: this.cornerRoomMirrored.height }, () => Array.from({ length: this.cornerRoomMirrored.width }, () => "floor_basic"));
        this.cornerRoomMirrored.layout[3][0] = "room_entrance_up";
        this.cornerRoomMirrored.layout[6][3] = "room_entrance_right";

        this.cornerRoomInvertedMirrored = new Room(7, 7, ["left", "down"], []); 
        this.cornerRoomInvertedMirrored.layout = Array.from({ length: this.cornerRoomInvertedMirrored.height }, () => Array.from({ length: this.cornerRoomInvertedMirrored.width }, () => "floor_basic"));
        this.cornerRoomInvertedMirrored.layout[3][6] = "room_entrance_down";
        this.cornerRoomInvertedMirrored.layout[0][3] = "room_entrance_left";

        this.TRoom = new Room(7, 7, ["left", "right", "down"], []);
        this.TRoom.layout = Array.from({ length: this.TRoom.height }, () => Array.from({ length: this.TRoom.width }, () => "floor_basic"));
        this.TRoom.layout[0][3] = "room_entrance_left";
        this.TRoom.layout[3][6] = "room_entrance_down";
        this.TRoom.layout[6][3] = "room_entrance_right";

        this.TRoomInverted = new Room(7, 7, ["left", "right", "up"], []);
        this.TRoomInverted.layout = Array.from({ length: this.TRoomInverted.height }, () => Array.from({ length: this.TRoomInverted.width }, () => "floor_basic"));
        this.TRoomInverted.layout[0][3] = "room_entrance_left";
        this.TRoomInverted.layout[3][0] = "room_entrance_up";
        this.TRoomInverted.layout[6][3] = "room_entrance_right";

        this.DeadEndRoomUp = new Room(5, 5, ["up"], []);
        this.DeadEndRoomUp.layout = Array.from({ length: this.DeadEndRoomUp.height }, () => Array.from({ length: this.DeadEndRoomUp.width }, () => "floor_basic"));
        this.DeadEndRoomUp.layout[2][0] = "room_entrance_up";

        this.DeadEndRoomDown = new Room(5, 5, ["down"], []);
        this.DeadEndRoomDown.layout = Array.from({ length: this.DeadEndRoomDown.height }, () => Array.from({ length: this.DeadEndRoomDown.width }, () => "floor_basic"));
        this.DeadEndRoomDown.layout[2][4] = "room_entrance_down";

        this.DeadEndRoomLeft = new Room(5, 5, ["left"], []);
        this.DeadEndRoomLeft.layout = Array.from({ length: this.DeadEndRoomLeft.height }, () => Array.from({ length: this.DeadEndRoomLeft.width }, () => "floor_basic"));
        this.DeadEndRoomLeft.layout[0][2] = "room_entrance_left";

        this.DeadEndRoomRight = new Room(5, 5, ["right"], []);
        this.DeadEndRoomRight.layout = Array.from({ length: this.DeadEndRoomRight.height }, () => Array.from({ length: this.DeadEndRoomRight.width }, () => "floor_basic"));
        this.DeadEndRoomRight.layout[4][2] = "room_entrance_right";
    }
 
    
}