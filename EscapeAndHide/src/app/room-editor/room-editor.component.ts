import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomsData } from '../rooms';
import { Room } from '../room';
import * as EntitiesModule from '../entities';
import * as EnemiesModule from '../enemyTypes';

type EntityFactory = { name: string; create: () => any };

@Component({
  selector: 'app-room-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-editor.component.html',
  styleUrls: ['./room-editor.component.css'],
})
export class RoomEditorComponent {
  @Output() close = new EventEmitter<void>();
  roomsData = new RoomsData();

  roomKeys: string[] = [];
  selectedRoomKey: string | null = null;
  selectedRoom: Room | null = null;

  entityPalette: EntityFactory[] = [];
  selectedTool: string = 'Empty';

  // fields for creating new rooms
  newRoomName = '';
  newRoomW = 10;
  newRoomH = 10;

  constructor() {
    // Build list of available rooms from known lists
    this.roomKeys = [
      ...this.roomsData.roomList,
      ...this.roomsData.deadEndRooms,
      ...this.roomsData.mainRooms,
    ];
    // Ensure uniqueness
    this.roomKeys = Array.from(new Set(this.roomKeys));

    if (this.roomKeys.length > 0) {
      this.selectRoom(this.roomKeys[0]);
    }

    // Build entity palette dynamically from exports in entities and enemyTypes
    const palette: EntityFactory[] = [];
    palette.push({ name: 'Empty', create: () => null });

    const addFromModule = (mod: any) => {
      for (const key of Object.keys(mod)) {
        // skip non-constructors
        const val = (mod as any)[key];
        if (typeof val !== 'function') continue;

        // avoid adding duplicate names
        if (palette.find((p) => p.name === key)) continue;

        // create a factory that tries to instantiate the constructor
        const factoryCreate = () => {
          try {
            // if constructor expects arguments, provide sensible defaults
            if (val.length && val.length > 0) {
              // special-case known constructors that require a string argument
              if (key.toLowerCase().includes('transition')) {
                return new val('up');
              }
              // fallback: try without args and catch if it fails
              return new val();
            }
            return new val();
          } catch (e) {
            // If instantiation fails, return null so callers can handle it
            console.warn('Failed to instantiate', key, e);
            return null;
          }
        };

        palette.push({ name: key, create: factoryCreate });
      }
    };

    addFromModule(EntitiesModule as any);
    addFromModule(EnemiesModule as any);

    this.entityPalette = palette;
  }

  selectRoom(key: string) {
    this.selectedRoomKey = key;
    const r = (this.roomsData as any)[key];
    if (r instanceof Room) {
      this.selectedRoom = r;
    } else {
      this.selectedRoom = null;
    }
  }

  createNewRoom() {
    if (!this.newRoomName) return;
    // create Room and add to roomsData under the name
    const room = new Room(this.newRoomW, this.newRoomH, [], []);
    room.layout = Array.from({ length: room.width }, () => Array.from({ length: room.height }));
    (this.roomsData as any)[this.newRoomName] = room;
    this.roomKeys.push(this.newRoomName);
    this.selectRoom(this.newRoomName);
    this.newRoomName = '';
  }

  deleteRoom(key: string) {
    // Replace with a noRoom placeholder and remove from lists
    (this.roomsData as any)[key] = new Room(1, 1, [], []);
    this.roomKeys = this.roomKeys.filter(k => k !== key);
    if (this.selectedRoomKey === key) {
      this.selectedRoomKey = this.roomKeys.length ? this.roomKeys[0] : null;
      if (this.selectedRoomKey) this.selectRoom(this.selectedRoomKey);
      else this.selectedRoom = null;
    }
  }

  tileClicked(x: number, y: number) {
    if (!this.selectedRoom) return;
    const tool = this.selectedTool;
    // find factory
    const f = this.entityPalette.find(e => e.name === tool);
    if (!f) return;
    const inst = f.create();
    // ensure layout arrays exist
    if (!this.selectedRoom.layout || typeof this.selectedRoom.layout === 'string') {
      this.selectedRoom.layout = Array.from({ length: this.selectedRoom.width }, () => Array.from({ length: this.selectedRoom!.height }));
    }
    const layout = this.selectedRoom.layout as any[][];
    layout[x][y] = inst;
  }

  tileLabel(x: number, y: number) {
    if (!this.selectedRoom) return '';
    const layout = this.selectedRoom.layout as any[][];
    if (!layout) return '';
    const val = layout[x] ? layout[x][y] : undefined;
    if (!val) return '';
    return val.name || (val.constructor && val.constructor.name) || '';
  }

  exportRoomJSON() {
    if (!this.selectedRoomKey || !this.selectedRoom) return '';
    const copy = JSON.parse(JSON.stringify(this.selectedRoom, (k, v) => {
      // strip functions and circular refs
      if (typeof v === 'function') return undefined;
      return v;
    }));
    console.log(JSON.stringify({ name: this.selectedRoomKey, room: copy }, null, 2));
    return JSON.stringify({ name: this.selectedRoomKey, room: copy }, null, 2);
  }

  // Generate TypeScript code suitable for copy-pasting into rooms.ts
  exportRoomTS() {
    if (!this.selectedRoomKey || !this.selectedRoom) return '';
    const key = this.selectedRoomKey;
    const room = this.selectedRoom;
    const lines: string[] = [];

    // Room constructor
    const entrances = Array.isArray(room.entrances) ? room.entrances.map((e: any) => `"${e}"`).join(', ') : '';
    lines.push(`this.${key} = new Room(${room.width}, ${room.height}, [${entrances}], []);`);
    lines.push(`this.${key}.layout = Array.from({ length: this.${key}.width }, () => Array.from({ length: this.${key}.height }));`);

    // Iterate layout and output assignments for non-empty tiles
    if (room.layout && typeof room.layout !== 'string') {
      const layout = room.layout as any[][];
      for (let x = 0; x < room.width; x++) {
        for (let y = 0; y < room.height; y++) {
          const val = layout[x] ? layout[x][y] : undefined;
          if (!val) continue;
          // determine class name
          const ctorName = val.constructor ? val.constructor.name : null;
          if (!ctorName) continue;
          let args = '';
          // special-case RoomTransition which stores its type in .type
          if (ctorName === 'RoomTransition' && (val as any).type) {
            args = `"${(val as any).type}"`;
          }
          // produce line
          lines.push(`this.${key}.layout[${x}][${y}] = new ${ctorName}(${args});`);
        }
      }
    }

    const out = lines.join('\n');
    const wrapped = '\n/* ---- Room code start ---- */\n' + out + '\n/* ---- Room code end ---- */\n';
    console.log(wrapped);
    // try to copy to clipboard (best effort)
    try {
      if ((navigator as any) && (navigator as any).clipboard && (navigator as any).clipboard.writeText) {
        (navigator as any).clipboard.writeText(wrapped).then(() => {
          console.log('Room TypeScript copied to clipboard');
          alert('Room TypeScript code copied to clipboard. Paste into rooms.ts');
        }).catch((e: any) => {
          console.warn('clipboard write failed', e);
        });
      }
    } catch (e) {
      // ignore
    }
    return out;
  }
}
