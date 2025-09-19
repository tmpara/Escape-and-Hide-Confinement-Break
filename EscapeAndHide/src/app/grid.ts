import { TestObject } from "./testobject";

export class GameGrid {
  width: number;
  height: number;
  obstacles: Set<string>; // Set of "x,y"
  objects: Map<{x: number; y: number }, TestObject>;
  players: Map<string, { x: number; y: number }>; // playerId => position

  constructor(width = 64, height = 64) {
    this.width = width;
    this.height = height;
    this.obstacles = new Set();
    this.objects = new Map();
    this.players = new Map();
  }

  posKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  isBlocked(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return true;
    if (this.objects.get({ x, y })?.tile.hasCollision == true) return true
    return this.obstacles.has(this.posKey(x, y)) ||
           [...this.players.values()].some(p => p.x === x && p.y === y);
  }

  addPlayer(id: string, x: number, y: number): boolean {
    if (this.isBlocked(x, y)) return false;
    this.players.set(id, { x, y });
    return true;
  }

  addObject(object: TestObject, x: number, y: number): boolean {
    if (this.isBlocked(x, y)) return false;
    this.objects.set({ x, y },object);
    return true;
  }

  movePlayer(id: string, dx: number, dy: number): boolean {
    const player = this.players.get(id);
    if (!player) return false;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (this.isBlocked(newX, newY)) return false;

    player.x = newX;
    player.y = newY;
    return true;
  }

  addObstacle(x: number, y: number): void {
    this.obstacles.add(this.posKey(x, y));
  }
}
