import { Room } from "./room";
import { Wall1,WallCorner1,ExplosiveBarrel,DoorHorizontal,DoorVertical,RoomTransition} from './entities'

export class RoomsData {

    startingRoom: Room;
    labComplex1: Room;
    crossHall1: Room;
    verticalHall: Room;
    horizontalHall: Room;
    
    roomList: string[] = [
        "startingRoom",
        "labComplex1",
        "crossHall1",
        "verticalHall",
        "horizontalHall"
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
    }
 
    
}