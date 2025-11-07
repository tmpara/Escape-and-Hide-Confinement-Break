import { Room } from "./room";

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
        this.startingRoom.layout = Array.from({ length: this.startingRoom.height }, () => Array.from({ length: this.startingRoom.width }, () => "floor_basic"));
        this.startingRoom.layout[0][4] = "room_entrance";
        this.startingRoom.layout[4][0] = "room_entrance";
        this.startingRoom.layout[4][8] = "room_entrance";
        this.startingRoom.layout[8][4] = "room_entrance";
        this.startingRoom.layout[4][2] = "wall_basic";
        this.startingRoom.layout[4][3] = "wall_basic";
        this.startingRoom.layout[4][4] = "wall_basic";
        this.startingRoom.layout[4][5] = "wall_basic";
        this.startingRoom.layout[4][6] = "wall_basic";
        
        this.labComplex1 = new Room(15, 15, ["up", "left", "right", "down"], []);
        this.labComplex1.layout = Array.from({ length: this.labComplex1.height }, () => Array.from({ length: this.labComplex1.width }, () => "floor_basic"));
        this.labComplex1.layout[0][7] = "room_entrance";
        this.labComplex1.layout[7][0] = "room_entrance";
        this.labComplex1.layout[7][14] = "room_entrance";
        this.labComplex1.layout[14][7] = "room_entrance";
        this.labComplex1.layout[1][5] = "wall_basic";
        this.labComplex1.layout[2][5] = "wall_basic";
        this.labComplex1.layout[3][5] = "wall_basic";
        this.labComplex1.layout[4][5] = "wall_basic";
        this.labComplex1.layout[5][5] = "wall_basic";
        this.labComplex1.layout[9][5] = "wall_basic";
        this.labComplex1.layout[10][5] = "wall_basic";
        this.labComplex1.layout[11][5] = "wall_basic";
        this.labComplex1.layout[12][5] = "wall_basic";
        this.labComplex1.layout[13][5] = "wall_basic";
        this.labComplex1.layout[1][9] = "wall_basic";
        this.labComplex1.layout[2][9] = "wall_basic";
        this.labComplex1.layout[3][9] = "wall_basic";
        this.labComplex1.layout[4][9] = "wall_basic";
        this.labComplex1.layout[5][9] = "wall_basic";
        this.labComplex1.layout[9][9] = "wall_basic";
        this.labComplex1.layout[10][9] = "wall_basic";
        this.labComplex1.layout[11][9] = "wall_basic";
        this.labComplex1.layout[12][9] = "wall_basic";
        this.labComplex1.layout[13][9] = "wall_basic";
        this.labComplex1.layout[5][1] = "wall_basic";
        this.labComplex1.layout[5][2] = "wall_basic";
        this.labComplex1.layout[5][3] = "wall_basic";
        this.labComplex1.layout[5][4] = "wall_basic";
        this.labComplex1.layout[5][5] = "wall_basic";
        this.labComplex1.layout[5][9] = "wall_basic";
        this.labComplex1.layout[5][10] = "wall_basic";
        this.labComplex1.layout[5][11] = "wall_basic";
        this.labComplex1.layout[5][12] = "wall_basic";
        this.labComplex1.layout[5][13] = "wall_basic";
        this.labComplex1.layout[9][1] = "wall_basic";
        this.labComplex1.layout[9][2] = "wall_basic";
        this.labComplex1.layout[9][3] = "wall_basic";
        this.labComplex1.layout[9][4] = "wall_basic";
        this.labComplex1.layout[9][5] = "wall_basic";
        this.labComplex1.layout[9][9] = "wall_basic";
        this.labComplex1.layout[9][10] = "wall_basic";
        this.labComplex1.layout[9][11] = "wall_basic";
        this.labComplex1.layout[9][12] = "wall_basic";
        this.labComplex1.layout[9][13] = "wall_basic";

        this.crossHall1 = new Room(15, 15, ["up", "left", "right", "down"], []);
        this.crossHall1.layout = Array.from({ length: this.labComplex1.height }, () => Array.from({ length: this.labComplex1.width }, () => "floor_basic"));
        this.crossHall1.layout[0][7] = "room_entrance";
        this.crossHall1.layout[7][0] = "room_entrance";
        this.crossHall1.layout[7][14] = "room_entrance";
        this.crossHall1.layout[14][7] = "room_entrance";

        this.verticalHall = new Room(5, 15, ["up", "down"], []);
        this.verticalHall.layout = Array.from({ length: this.verticalHall.width }, () => Array.from({ length: this.verticalHall.height }, () => "floor_basic"));
        this.verticalHall.layout[2][0] = "room_entrance";
        this.verticalHall.layout[2][14] = "room_entrance";

        this.horizontalHall = new Room(15, 5, ["left", "right"], []);   
        this.horizontalHall.layout = Array.from({ length: this.horizontalHall.width }, () => Array.from({ length: this.horizontalHall.height }, () => "floor_basic"));
        this.horizontalHall.layout[0][2] = "room_entrance";
        this.horizontalHall.layout[14][2] = "room_entrance"; 
    }
 
    
}