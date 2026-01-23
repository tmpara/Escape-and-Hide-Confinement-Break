
import { Room } from "./room";
import { Wall1,WallCorner1,ExplosiveBarrel,DoorHorizontal,DoorVertical,RoomTransition,Crate,WeaponCrate,MedicalCrate,Mine} from './entities'
import { LightInterferanceUnit } from "./enemyTypes";

export class RoomsData {

    startingRoom: Room;
    storageComplex1: Room;
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
    testCircle: Room;

    roomList: string[] = [
        "storageComplex1",
        "crossHall1",
        "verticalHall",
        "horizontalHall",
        "cornerRoom",
        "cornerRoomInverted",
        "cornerRoomMirrored",
        "cornerRoomInvertedMirrored",
        "TRoom",
        "TRoomInverted",
        "TRoomMirrored",
        "TRoomInvertedMirrored",
        "testCircle",
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
        
        this.storageComplex1 = new Room(15, 15, ["up", "left", "right", "down"], []);
        this.storageComplex1.layout = Array.from({ length: this.storageComplex1.width }, () => Array.from({ length: this.storageComplex1.height}));
        this.storageComplex1.layout[0][7] = new RoomTransition("left");
        this.storageComplex1.layout[7][0] = new RoomTransition("up");
        this.storageComplex1.layout[7][14] = new RoomTransition("down");
        this.storageComplex1.layout[14][7] = new RoomTransition("right");
        this.storageComplex1.layout[5][7] = new Mine() 
        this.storageComplex1.layout[1][5] = new Wall1();
        this.storageComplex1.layout[2][5] = new Wall1();
        this.storageComplex1.layout[3][5] = new DoorVertical();
        this.storageComplex1.layout[4][5] = new Wall1();
        this.storageComplex1.layout[5][5] = new Wall1();
        this.storageComplex1.layout[9][5] = new Wall1();
        this.storageComplex1.layout[10][5] = new Wall1();
        this.storageComplex1.layout[12][5] = new Wall1();
        this.storageComplex1.layout[13][5] = new Wall1();
        this.storageComplex1.layout[1][9] = new Wall1();
        this.storageComplex1.layout[2][9] = new Wall1();
        this.storageComplex1.layout[3][9] = new DoorVertical();
        this.storageComplex1.layout[4][9] = new Wall1();
        this.storageComplex1.layout[5][9] = new Wall1();
        this.storageComplex1.layout[9][9] = new Wall1();
        this.storageComplex1.layout[10][9] = new Wall1();
        this.storageComplex1.layout[12][9] = new Wall1();
        this.storageComplex1.layout[13][9] = new Wall1();
        this.storageComplex1.layout[5][1] = new Wall1();
        this.storageComplex1.layout[5][2] = new Wall1();
        this.storageComplex1.layout[5][3] = new DoorHorizontal();
        this.storageComplex1.layout[5][4] = new Wall1();
        this.storageComplex1.layout[5][5] = new Wall1();
        this.storageComplex1.layout[5][9] = new Wall1();
        this.storageComplex1.layout[5][10] = new Wall1();
        this.storageComplex1.layout[5][11] = new DoorHorizontal();
        this.storageComplex1.layout[5][12] = new Wall1();
        this.storageComplex1.layout[5][13] = new Wall1();
        this.storageComplex1.layout[9][1] = new Wall1();
        this.storageComplex1.layout[9][2] = new Wall1();
        this.storageComplex1.layout[9][3] = new DoorHorizontal();
        this.storageComplex1.layout[9][4] = new Wall1();
        this.storageComplex1.layout[9][5] = new Wall1();
        this.storageComplex1.layout[9][9] = new Wall1();
        this.storageComplex1.layout[9][10] = new Wall1();
        this.storageComplex1.layout[9][11] = new DoorHorizontal();
        this.storageComplex1.layout[9][12] = new Wall1();
        this.storageComplex1.layout[9][13] = new Wall1();
        this.storageComplex1.layout[11][5] = new DoorVertical()
        this.storageComplex1.layout[11][9] = new DoorVertical()
        this.storageComplex1.layout[1][1] = new ExplosiveBarrel
        this.storageComplex1.layout[1][2] = new ExplosiveBarrel
        this.storageComplex1.layout[1][4] = new ExplosiveBarrel
        this.storageComplex1.layout[2][1] = new ExplosiveBarrel
        this.storageComplex1.layout[2][2] = new ExplosiveBarrel
        this.storageComplex1.layout[3][1] = new ExplosiveBarrel
        this.storageComplex1.layout[3][2] = new ExplosiveBarrel
        this.storageComplex1.layout[4][1] = new ExplosiveBarrel
        this.storageComplex1.layout[4][2] = new ExplosiveBarrel
        this.storageComplex1.layout[12][1] = new Crate
        this.storageComplex1.layout[12][2] = new Crate
        this.storageComplex1.layout[13][1] = new Crate
        this.storageComplex1.layout[13][2] = new Crate
        this.storageComplex1.layout[13][10] = new MedicalCrate
        this.storageComplex1.layout[11][12] = new MedicalCrate
        this.storageComplex1.layout[13][13] = new Crate
        this.storageComplex1.layout[10][10] = new Crate
        this.storageComplex1.layout[4][10] = new WeaponCrate
        this.storageComplex1.layout[4][13] = new Crate
        this.storageComplex1.layout[2][11] = new Crate
        this.storageComplex1.layout[2][12] = new WeaponCrate
        this.storageComplex1.layout[1][10] = new Crate
        this.storageComplex1.layout[1][13] = new ExplosiveBarrel
        this.storageComplex1.layout[1][6] = new Crate
        this.storageComplex1.layout[13][6] = new Crate
        this.storageComplex1.layout[12][6] = new ExplosiveBarrel
        this.storageComplex1.layout[10][7] = new Crate

        this.startingRoom = new Room(15, 9, ["up", "left", "right", "down"], []);
        this.startingRoom.layout = Array.from({ length: this.startingRoom.width }, () => Array.from({ length: this.startingRoom.height }));
        this.startingRoom.layout[0][4] = new RoomTransition("left");
        this.startingRoom.layout[7][0] = new RoomTransition("up");
        this.startingRoom.layout[7][8] = new RoomTransition("down");
        this.startingRoom.layout[14][4] = new RoomTransition("right");
  
        
/* ---- Room code start ---- */
this.crossHall1 = new Room(15, 15, ["up", "left", "right", "down"], []);
this.crossHall1.layout = Array.from({ length: this.crossHall1.width }, () => Array.from({ length: this.crossHall1.height }));
this.crossHall1.layout[0][7] = new RoomTransition("left");
this.crossHall1.layout[4][5] = new Crate();
this.crossHall1.layout[4][8] = new ExplosiveBarrel();
this.crossHall1.layout[5][8] = new WeaponCrate();
this.crossHall1.layout[7][0] = new RoomTransition("up");
this.crossHall1.layout[7][14] = new RoomTransition("down");
this.crossHall1.layout[14][7] = new RoomTransition("right");
/* ---- Room code end ---- */


/* ---- Room code start ---- */
this.testCircle = new Room(7, 7, ["up", "left", "right", "down"], []);
this.testCircle.layout = Array.from({ length: this.testCircle.width }, () => Array.from({ length: this.testCircle.height }));
this.testCircle.layout[0][2] = new Wall1();
this.testCircle.layout[0][3] = new RoomTransition("left");
this.testCircle.layout[0][4] = new Wall1();
this.testCircle.layout[1][1] = new Wall1();
this.testCircle.layout[1][5] = new Wall1();
this.testCircle.layout[2][0] = new Wall1();
this.testCircle.layout[2][6] = new Wall1();
this.testCircle.layout[3][0] = new RoomTransition("up");
this.testCircle.layout[3][6] = new RoomTransition("down");
this.testCircle.layout[4][0] = new Wall1();
this.testCircle.layout[4][6] = new Wall1();
this.testCircle.layout[5][1] = new Wall1();
this.testCircle.layout[5][5] = new Wall1();
this.testCircle.layout[6][2] = new Wall1();
this.testCircle.layout[6][3] = new RoomTransition("right");
this.testCircle.layout[6][4] = new Wall1();
/* ---- Room code end ---- */



        this.verticalHall = new Room(5, 15, ["up", "down"], []);
        this.verticalHall.layout = Array.from({ length: this.verticalHall.width }, () => Array.from({ length: this.verticalHall.height }));
        this.verticalHall.layout[2][0] = new RoomTransition("up");
        this.verticalHall.layout[2][14] = new RoomTransition("down");

        this.horizontalHall = new Room(15, 5, ["left", "right"], []);   
        this.horizontalHall.layout = Array.from({ length: this.horizontalHall.width }, () => Array.from({ length: this.horizontalHall.height }));
        this.horizontalHall.layout[0][2] = new RoomTransition("left");
        this.horizontalHall.layout[14][2] = new RoomTransition("right");
        
        this.cornerRoom = new Room(7, 7, ["left", "up"], []);
        this.cornerRoom.layout = Array.from({ length: this.cornerRoom.width }, () => Array.from({ length: this.cornerRoom.height }));
        this.cornerRoom.layout[0][3] = new RoomTransition("left");
        this.cornerRoom.layout[3][0] = new RoomTransition("up");

        this.cornerRoomInverted = new Room(7, 7, ["right", "down"], []); 
        this.cornerRoomInverted.layout = Array.from({ length: this.cornerRoomInverted.width }, () => Array.from({ length: this.cornerRoomInverted.height }));
        this.cornerRoomInverted.layout[3][6] = new RoomTransition("down");
        this.cornerRoomInverted.layout[6][3] = new RoomTransition("right");

        this.cornerRoomMirrored = new Room(7, 7, ["right", "up"], []);
        this.cornerRoomMirrored.layout = Array.from({ length: this.cornerRoomMirrored.width }, () => Array.from({ length: this.cornerRoomMirrored.height }));
        this.cornerRoomMirrored.layout[3][0] = new RoomTransition("up");
        this.cornerRoomMirrored.layout[6][3] = new RoomTransition("right");

        this.cornerRoomInvertedMirrored = new Room(7, 7, ["left", "down"], []); 
        this.cornerRoomInvertedMirrored.layout = Array.from({ length: this.cornerRoomInvertedMirrored.width }, () => Array.from({ length: this.cornerRoomInvertedMirrored.height }));
        this.cornerRoomInvertedMirrored.layout[3][6] = new RoomTransition("down");
        this.cornerRoomInvertedMirrored.layout[0][3] = new RoomTransition("left");

        this.TRoom = new Room(7, 7, ["left", "right", "down"], []);
        this.TRoom.layout = Array.from({ length: this.TRoom.width }, () => Array.from({ length: this.TRoom.height }));
        this.TRoom.layout[0][3] = new RoomTransition("left");
        this.TRoom.layout[3][6] = new RoomTransition("down");
        this.TRoom.layout[6][3] = new RoomTransition("right");

        this.TRoomInverted = new Room(7, 7, ["left", "right", "up"], []);
        this.TRoomInverted.layout = Array.from({ length: this.TRoomInverted.width }, () => Array.from({ length: this.TRoomInverted.height }));
        this.TRoomInverted.layout[0][3] = new RoomTransition("left");
        this.TRoomInverted.layout[3][0] = new RoomTransition("up");
        this.TRoomInverted.layout[6][3] = new RoomTransition("right");

        this.TRoomMirrored = new Room(7, 7, ["up", "down", "right"], []);
        this.TRoomMirrored.layout = Array.from({ length: this.TRoomMirrored.width }, () => Array.from({ length: this.TRoomMirrored.height }));
        this.TRoomMirrored.layout[3][0] = new RoomTransition("up");
        this.TRoomMirrored.layout[3][6] = new RoomTransition("down");
        this.TRoomMirrored.layout[6][3] = new RoomTransition("right");
        
        this.TRoomInvertedMirrored = new Room(7, 7, ["up", "down", "left"], []);
        this.TRoomInvertedMirrored.layout = Array.from({ length: this.TRoomInvertedMirrored.width }, () => Array.from({ length: this.TRoomInvertedMirrored.height }));
        this.TRoomInvertedMirrored.layout[3][0] = new RoomTransition("up");
        this.TRoomInvertedMirrored.layout[3][6] = new RoomTransition("down");
        this.TRoomInvertedMirrored.layout[0][3] = new RoomTransition("left");

        this.DeadEndRoomUp = new Room(5, 5, ["up"], []);
        this.DeadEndRoomUp.layout = Array.from({ length: this.DeadEndRoomUp.width }, () => Array.from({ length: this.DeadEndRoomUp.height }));
        this.DeadEndRoomUp.layout[2][0] = new RoomTransition("up");

        this.DeadEndRoomDown = new Room(5, 5, ["down"], []);
        this.DeadEndRoomDown.layout = Array.from({ length: this.DeadEndRoomDown.width }, () => Array.from({ length: this.DeadEndRoomDown.height }));
        this.DeadEndRoomDown.layout[2][4] = new RoomTransition("down");

        this.DeadEndRoomLeft = new Room(5, 5, ["left"], []);
        this.DeadEndRoomLeft.layout = Array.from({ length: this.DeadEndRoomLeft.width }, () => Array.from({ length: this.DeadEndRoomLeft.height }));
        this.DeadEndRoomLeft.layout[0][2] = new RoomTransition("left");

        this.DeadEndRoomRight = new Room(5, 5, ["right"], []);
        this.DeadEndRoomRight.layout = Array.from({ length: this.DeadEndRoomRight.width }, () => Array.from({ length: this.DeadEndRoomRight.height }));
        this.DeadEndRoomRight.layout[4]/* ---- Room code end ---- */[2] = new RoomTransition("right");
    
        this.endingRoom = new Room(13, 13, ["up", "left", "right", "down"], []);
        this.endingRoom.layout = Array.from({ length: this.endingRoom.width }, () => Array.from({ length: this.endingRoom.height }));
        this.endingRoom.layout[0][6] = new RoomTransition("up");
        this.endingRoom.layout[6][0] = new RoomTransition("left");
        this.endingRoom.layout[6][12] = new RoomTransition("right");
        this.endingRoom.layout[12][6] = new RoomTransition("down");

        this.noRoom = new Room(1, 1, [], []);
        // this.noRoom.layout = [["empty"]];
    }


 
    
}
