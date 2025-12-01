import { Room } from "./room";
import { Wall1,WallCorner1,ExplosiveBarrel,DoorHorizontal,DoorVertical,RoomTransition} from './entities'

export class RoomsData {

    startingRoom: Room;
    labComplex1: Room;
    crossHall1: Room;
    verticalHall: Room;
    horizontalHall: Room;
    cornerRoom: Room;
    cornerRoomInverted: Room;
    cornerRoomMirrored: Room;
    cornerRoomInvertedMirrored: Room;
    TRoom: Room;
    TRoomInverted: Room;
    TRoomMirrored: Room;
    TRoomInvertedMirrored: Room;
    DeadEndRoomUp: Room;
    DeadEndRoomDown: Room;
    DeadEndRoomLeft: Room
    DeadEndRoomRight: Room;
    endingRoom: Room;
    noRoom: Room;
    
    roomList: string[] = [
        "startingRoom",
        "labComplex1",
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
        "DeadEndRoomRight",
        //"noRoom"
    ];

    mainRooms: string[] = [
        "startingRoom",
        "endingRoom",
    ]

    constructor() {
        this.startingRoom = new Room(9, 9, ["up", "left", "right", "down"], []);
        this.startingRoom.layout = Array.from({ length: this.startingRoom.width }, () => Array.from({ length: this.startingRoom.height}));
        this.startingRoom.layout[0][4] = new RoomTransition();
        this.startingRoom.layout[4][0] = new RoomTransition();
        this.startingRoom.layout[4][8] = new RoomTransition();
        this.startingRoom.layout[8][4] = new RoomTransition();
        this.startingRoom.layout[4][2] = new Wall1();
        this.startingRoom.layout[4][3] = new Wall1();
        this.startingRoom.layout[4][4] = new Wall1();
        this.startingRoom.layout[4][5] = new Wall1();
        this.startingRoom.layout[4][6] = new Wall1();
        
        this.labComplex1 = new Room(15, 15, ["up", "left", "right", "down"], []);
        this.labComplex1.layout = Array.from({ length: this.labComplex1.width }, () => Array.from({ length: this.labComplex1.height}));
        this.labComplex1.layout[0][7] = new RoomTransition();
        this.labComplex1.layout[7][0] = new RoomTransition();
        this.labComplex1.layout[7][14] = new RoomTransition();
        this.labComplex1.layout[14][7] = new RoomTransition();
        this.labComplex1.layout[1][5] = new Wall1();
        this.labComplex1.layout[2][5] = new Wall1();
        this.labComplex1.layout[3][5] = new DoorVertical();
        this.labComplex1.layout[4][5] = new Wall1();
        this.labComplex1.layout[5][5] = new Wall1();
        this.labComplex1.layout[9][5] = new Wall1();
        this.labComplex1.layout[10][5] = new Wall1();
        this.labComplex1.layout[12][5] = new Wall1();
        this.labComplex1.layout[13][5] = new Wall1();
        this.labComplex1.layout[14][5] = new Wall1();
        this.labComplex1.layout[1][9] = new Wall1();
        this.labComplex1.layout[2][9] = new Wall1();
        this.labComplex1.layout[3][9] = new DoorVertical();
        this.labComplex1.layout[4][9] = new Wall1();
        this.labComplex1.layout[5][9] = new Wall1();
        this.labComplex1.layout[9][9] = new Wall1();
        this.labComplex1.layout[10][9] = new Wall1();
        this.labComplex1.layout[12][9] = new Wall1();
        this.labComplex1.layout[13][9] = new Wall1();
        this.labComplex1.layout[5][1] = new Wall1();
        this.labComplex1.layout[5][2] = new Wall1();
        this.labComplex1.layout[5][3] = new DoorHorizontal();
        this.labComplex1.layout[5][4] = new Wall1();
        this.labComplex1.layout[5][5] = new Wall1();
        this.labComplex1.layout[5][9] = new Wall1();
        this.labComplex1.layout[5][10] = new Wall1();
        this.labComplex1.layout[5][11] = new DoorHorizontal();
        this.labComplex1.layout[5][12] = new Wall1();
        this.labComplex1.layout[5][13] = new Wall1();
        this.labComplex1.layout[5][14] = new Wall1();
        this.labComplex1.layout[9][1] = new Wall1();
        this.labComplex1.layout[9][2] = new Wall1();
        this.labComplex1.layout[9][3] = new DoorHorizontal();
        this.labComplex1.layout[9][4] = new Wall1();
        this.labComplex1.layout[9][5] = new Wall1();
        this.labComplex1.layout[9][9] = new Wall1();
        this.labComplex1.layout[9][10] = new Wall1();
        this.labComplex1.layout[9][11] = new DoorHorizontal();
        this.labComplex1.layout[9][12] = new Wall1();
        this.labComplex1.layout[9][13] = new Wall1();
        this.labComplex1.layout[9][14] = new Wall1();
        this.labComplex1.layout[11][5] = new DoorHorizontal
        this.labComplex1.layout[11][9] = new DoorHorizontal
        this.labComplex1.layout[1][1] = new ExplosiveBarrel
        this.labComplex1.layout[1][2] = new ExplosiveBarrel
        this.labComplex1.layout[2][1] = new ExplosiveBarrel
        this.labComplex1.layout[2][2] = new ExplosiveBarrel

        this.crossHall1 = new Room(15, 15, ["up", "left", "right", "down"], []);
        this.crossHall1.layout = Array.from({ length: this.crossHall1.width }, () => Array.from({ length: this.crossHall1.height}));
        this.crossHall1.layout[0][7] = new RoomTransition();
        this.crossHall1.layout[7][0] = new RoomTransition();
        this.crossHall1.layout[7][14] = new RoomTransition();
        this.crossHall1.layout[14][7] = new RoomTransition();
        

        this.verticalHall = new Room(5, 15, ["up", "down"], []);
        this.verticalHall.layout = Array.from({ length: this.verticalHall.width }, () => Array.from({ length: this.verticalHall.height}));
        this.verticalHall.layout[2][0] = new RoomTransition();
        this.verticalHall.layout[2][14] = new RoomTransition();

        this.horizontalHall = new Room(15, 5, ["left", "right"], []);   
        this.horizontalHall.layout = Array.from({ length: this.horizontalHall.width }, () => Array.from({ length: this.horizontalHall.height}));
        this.horizontalHall.layout[0][2] = new RoomTransition();
        this.horizontalHall.layout[14][2] = new RoomTransition();
        this.startingRoom = new Room(15, 9, ["up", "left", "right", "down"], []);
        this.startingRoom.layout = Array.from({ length: this.startingRoom.width }, () => Array.from({ length: this.startingRoom.height }, () => "floor_basic"));
        this.startingRoom.layout[0][4] = "room_entrance_left"; // left entrance
        this.startingRoom.layout[7][0] = "room_entrance_up"; // up entrance
        this.startingRoom.layout[7][8] = "room_entrance_down"; // down entrance
        this.startingRoom.layout[14][4] = "room_entrance_right"; // right entrance
        
        this.testRoomUp = new Room(15, 15, ["up", "left", "right", "down"], []);
        this.testRoomUp.layout = Array.from({ length: this.testRoomUp.width }, () => Array.from({ length: this.testRoomUp.height }, () => "floor_basic"));
        this.testRoomUp.layout[0][7] = "room_entrance_left";
        this.testRoomUp.layout[7][0] = "room_entrance_up";
        this.testRoomUp.layout[7][14] = "room_entrance_down";
        this.testRoomUp.layout[14][7] = "room_entrance_right";

        this.crossHall1 = new Room(15, 15, ["up", "left", "right", "down"], []);
        this.crossHall1.layout = Array.from({ length: this.crossHall1.width }, () => Array.from({ length: this.crossHall1.height }, () => "floor_basic"));
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
        this.cornerRoom.layout = Array.from({ length: this.cornerRoom.width }, () => Array.from({ length: this.cornerRoom.height }, () => "floor_basic"));
        this.cornerRoom.layout[0][3] = "room_entrance_left"; 
        this.cornerRoom.layout[3][0] = "room_entrance_up"; 

        this.cornerRoomInverted = new Room(7, 7, ["right", "down"], []); 
        this.cornerRoomInverted.layout = Array.from({ length: this.cornerRoomInverted.width }, () => Array.from({ length: this.cornerRoomInverted.height }, () => "floor_basic"));
        this.cornerRoomInverted.layout[3][6] = "room_entrance_down"; 
        this.cornerRoomInverted.layout[6][3] = "room_entrance_right"; 

        this.cornerRoomMirrored = new Room(7, 7, ["right", "up"], []);
        this.cornerRoomMirrored.layout = Array.from({ length: this.cornerRoomMirrored.width }, () => Array.from({ length: this.cornerRoomMirrored.height }, () => "floor_basic"));
        this.cornerRoomMirrored.layout[3][0] = "room_entrance_up";
        this.cornerRoomMirrored.layout[6][3] = "room_entrance_right";

        this.cornerRoomInvertedMirrored = new Room(7, 7, ["left", "down"], []); 
        this.cornerRoomInvertedMirrored.layout = Array.from({ length: this.cornerRoomInvertedMirrored.width }, () => Array.from({ length: this.cornerRoomInvertedMirrored.height }, () => "floor_basic"));
        this.cornerRoomInvertedMirrored.layout[3][6] = "room_entrance_down";
        this.cornerRoomInvertedMirrored.layout[0][3] = "room_entrance_left";

        this.TRoom = new Room(7, 7, ["left", "right", "down"], []);
        this.TRoom.layout = Array.from({ length: this.TRoom.width }, () => Array.from({ length: this.TRoom.height }, () => "floor_basic"));
        this.TRoom.layout[0][3] = "room_entrance_left";
        this.TRoom.layout[3][6] = "room_entrance_down";
        this.TRoom.layout[6][3] = "room_entrance_right";

        this.TRoomInverted = new Room(7, 7, ["left", "right", "up"], []);
        this.TRoomInverted.layout = Array.from({ length: this.TRoomInverted.width }, () => Array.from({ length: this.TRoomInverted.height }, () => "floor_basic"));
        this.TRoomInverted.layout[0][3] = "room_entrance_left";
        this.TRoomInverted.layout[3][0] = "room_entrance_up";
        this.TRoomInverted.layout[6][3] = "room_entrance_right";

        this.TRoomMirrored = new Room(7, 7, ["up", "down", "right"], []);
        this.TRoomMirrored.layout = Array.from({ length: this.TRoomMirrored.width }, () => Array.from({ length: this.TRoomMirrored.height }, () => "floor_basic"));
        this.TRoomMirrored.layout[3][0] = "room_entrance_up";
        this.TRoomMirrored.layout[3][6] = "room_entrance_down";
        this.TRoomMirrored.layout[6][3] = "room_entrance_right";
        
        this.TRoomInvertedMirrored = new Room(7, 7, ["up", "down", "left"], []);
        this.TRoomInvertedMirrored.layout = Array.from({ length: this.TRoomInvertedMirrored.width }, () => Array.from({ length: this.TRoomInvertedMirrored.height }, () => "floor_basic"));
        this.TRoomInvertedMirrored.layout[3][0] = "room_entrance_up";
        this.TRoomInvertedMirrored.layout[3][6] = "room_entrance_down";
        this.TRoomInvertedMirrored.layout[0][3] = "room_entrance_left";

        this.DeadEndRoomUp = new Room(5, 5, ["up"], []);
        this.DeadEndRoomUp.layout = Array.from({ length: this.DeadEndRoomUp.width }, () => Array.from({ length: this.DeadEndRoomUp.height }, () => "floor_basic"));
        this.DeadEndRoomUp.layout[2][0] = "room_entrance_up";

        this.DeadEndRoomDown = new Room(5, 5, ["down"], []);
        this.DeadEndRoomDown.layout = Array.from({ length: this.DeadEndRoomDown.width }, () => Array.from({ length: this.DeadEndRoomDown.height }, () => "floor_basic"));
        this.DeadEndRoomDown.layout[2][4] = "room_entrance_down";

        this.DeadEndRoomLeft = new Room(5, 5, ["left"], []);
        this.DeadEndRoomLeft.layout = Array.from({ length: this.DeadEndRoomLeft.width }, () => Array.from({ length: this.DeadEndRoomLeft.height }, () => "floor_basic"));
        this.DeadEndRoomLeft.layout[0][2] = "room_entrance_left";

        this.DeadEndRoomRight = new Room(5, 5, ["right"], []);
        this.DeadEndRoomRight.layout = Array.from({ length: this.DeadEndRoomRight.width }, () => Array.from({ length: this.DeadEndRoomRight.height }, () => "floor_basic"));
        this.DeadEndRoomRight.layout[4][2] = "room_entrance_right";
    
        this.endingRoom = new Room(13, 13, ["up", "left", "right", "down"], []);
        this.endingRoom.layout = Array.from({ length: this.endingRoom.width }, () => Array.from({ length: this.endingRoom.height }, () => "floor_basic"));
        this.endingRoom.layout[0][6] = "room_entrance_up"; // up entrance
        this.endingRoom.layout[6][0] = "room_entrance_left"; // left entrance
        this.endingRoom.layout[6][12] = "room_entrance_right"; // right entrance
        this.endingRoom.layout[12][6] = "room_entrance_down"; // down entrance

        this.noRoom = new Room(1, 1, [], []);
        this.noRoom.layout = [["empty"]];
    }


 
    
}