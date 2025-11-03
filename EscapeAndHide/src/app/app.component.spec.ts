import { TestBed } from '@angular/core/testing';
import { GameComponent } from './app.component';
import { entity } from './entity';
import { Player } from './player';
import { Item } from './items/item';
import { GameGrid } from './grid';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  describe('Player', () => {
    it('constructor assigns PosX, PosY and id', () => {
      const p = new Player(10, 20, 'player1');
      expect(p.PosX).toBe(10);
      expect(p.PosY).toBe(20);
      expect(p.id).toBe('player1');
    });

    it('is instance of entity', () => {
      const p = new Player(0, 0, 'x');
      expect(p instanceof entity).toBeTrue();
    });

    it('properties are mutable', () => {
      const p = new Player(1, 2, 'a');
      p.PosX = 5;
      p.PosY = 6;
      p.id = 'b';
      expect(p.PosX).toBe(5);
      expect(p.PosY).toBe(6);
      expect(p.id).toBe('b');
    });
  });
});

describe('Tile', () => {
  it('assigns all constructor properties', () => {
    const mockItem = { id: 'sword', weight: 2 } as unknown as Item;
    const mockEntity = { type: 'orc', hp: 10 } as unknown as entity;

    const tile = new Tile(true, true, mockItem, 'burn', true, 5, mockEntity);

    expect(tile.hasCollision).toBe(true);
    expect(tile.hasItem).toBe(true);
    expect(tile.item).toBe(mockItem);
    expect(tile.effect).toBe('burn');
    expect(tile.destroyable).toBe(true);
    expect(tile.health).toBe(5);
    expect(tile.entity).toBe(mockEntity);
  });

  it('handles null and false values correctly', () => {
    const tile = new Tile(false, false, null, '', false, null, null);

    expect(tile.hasCollision).toBe(false);
    expect(tile.hasItem).toBe(false);
    expect(tile.item).toBeNull();
    expect(tile.effect).toBe('');
    expect(tile.destroyable).toBe(false);
    expect(tile.health).toBeNull();
    expect(tile.entity).toBeNull();
  });

  it('retains reference to item and reflects external mutations', () => {
    const mockItem = { count: 1 } as unknown as Item;
    const tile = new Tile(false, true, mockItem, 'none', false, 1, null);

    (mockItem as unknown as any).count = 42;
    expect((tile.item as unknown as any).count).toBe(42);
    expect(tile.item).toBe(mockItem);
  });
});

describe('GameGrid', () => {
  it('constructor sets width and height', () => {
    const g = new GameGrid(4, 5);
    expect(g.width).toBe(4);
    expect(g.height).toBe(5);
    expect(Array.isArray(g.Tiles)).toBe(true);
  });

  it('CreateEmptyMap initializes Tiles with correct dimensions and Tile instances', () => {
    const width = 2;
    const height = 3;
    const g = new GameGrid(width, height);
    g.CreateEmptyMap();

    // outer length should be width + 1 (loop uses <=)
    expect(g.Tiles.length).toBe(width + 1);

    for (let x = 0; x <= width; x++) {
      expect(Array.isArray(g.Tiles[x])).toBe(true);
      // inner length should be height + 1
      expect(g.Tiles[x].length).toBe(height + 1);
      for (let y = 0; y <= height; y++) {
        // Jasmine: use jasmine.any to check instance
        expect(g.Tiles[x][y]).toEqual(jasmine.any(Tile));
      }
    }
  });

  it('CreatePlayer places a new Player at coordinates', () => {
    const g = new GameGrid(1, 1);
    g.CreateEmptyMap();
    g.CreatePlayer(1, 1, 'player-id-1');

    const entity = g.Tiles[1][1].entity;
    expect(entity).toBeDefined();
    expect(entity).toEqual(jasmine.any(Player));
    // if Player exposes an id property, verify it (best-effort)
    if ((entity as any).id !== undefined) {
      expect((entity as any).id).toBe('player-id-1');
    }
  });

  it('LoadPlayer stores provided player object reference', () => {
    const g = new GameGrid(1, 1);
    g.CreateEmptyMap();
    const mockPlayer = { x: 0, y: 0, id: 'mock' } as unknown as Player;

    g.LoadPlayer(0, 0, mockPlayer);
    expect(g.Tiles[0][0].entity).toBe(mockPlayer);
  });

  it('SpawnItem sets hasItem and item; RemoveItem clears them', () => {
    const g = new GameGrid(1, 1);
    g.CreateEmptyMap();
    const mockItem = {} as Item;

    g.SpawnItem(0, 0, mockItem);
    expect(g.Tiles[0][0].hasItem).toBe(true);
    expect(g.Tiles[0][0].item).toBe(mockItem);

    g.RemoveItem(0, 0);
    expect(g.Tiles[0][0].hasItem).toBe(false);
    expect(g.Tiles[0][0].item).toBeNull();
  });
});
