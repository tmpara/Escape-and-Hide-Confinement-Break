import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryComponent } from './inventory.component';
import { inventoryRendering } from './inventoryRendering';
import { Inventory } from './inventory';
import { Item } from '../items/item';

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('inventoryRendering - basic action methods', () => {
  function createRenderingWithMocks(impls?: {
    equip?: (...args: any[]) => any;
    unequip?: (...args: any[]) => any;
    add?: (...args: any[]) => any;
    remove?: (...args: any[]) => any;
  }) {
    // create instance without invoking constructor
    const render = Object.create(
      inventoryRendering.prototype
    ) as inventoryRendering;

    // minimal DOM placeholders
    render.container = document.createElement('div');
    render.equippedContainer = document.createElement('div');

    // create mock inventory with spies
    const mockInventory: any = {
      items: [],
      equippedItems: [],
      equipItem: jasmine.createSpy('equipItem'),
      unequipItem: jasmine.createSpy('unequipItem'),
      addItem: jasmine.createSpy('addItem'),
      removeItem: jasmine.createSpy('removeItem'),
    };

    if (impls?.equip) {
      (mockInventory.equipItem as jasmine.Spy).and.callFake(impls.equip);
    }
    if (impls?.unequip) {
      (mockInventory.unequipItem as jasmine.Spy).and.callFake(impls.unequip);
    }
    if (impls?.add) {
      (mockInventory.addItem as jasmine.Spy).and.callFake(impls.add);
    }
    if (impls?.remove) {
      (mockInventory.removeItem as jasmine.Spy).and.callFake(impls.remove);
    }

    render.inventory = mockInventory;

    // avoid PIXI usage by stubbing display methods
    (render as any).displayInventory = jasmine.createSpy('displayInventory');
    (render as any).displayEquipped = jasmine.createSpy('displayEquipped');

    return { render, mockInventory };
  }

  it('equip calls inventory.equipItem with index and refreshes displays', () => {
    const { render, mockInventory } = createRenderingWithMocks();
    render.equip(3);

    expect(mockInventory.equipItem).toHaveBeenCalledTimes(1);
    expect(mockInventory.equipItem).toHaveBeenCalledWith(3);
    expect((render as any).displayInventory).toHaveBeenCalledTimes(1);
    expect((render as any).displayEquipped).toHaveBeenCalledTimes(1);
  });

  it('equip propagates errors from inventory.equipItem and does not refresh displays', () => {
    const throwing = () => {
      throw new Error('equip failed');
    };
    const { render, mockInventory } = createRenderingWithMocks({
      equip: throwing,
    });

    expect(() => render.equip(1)).toThrowError('equip failed');
    expect(mockInventory.equipItem).toHaveBeenCalledTimes(1);
    expect((render as any).displayInventory).not.toHaveBeenCalled();
    expect((render as any).displayEquipped).not.toHaveBeenCalled();
  });

  it('unequip calls inventory.unequipItem with index and refreshes displays', () => {
    const { render, mockInventory } = createRenderingWithMocks();
    render.unequip(2);

    expect(mockInventory.unequipItem).toHaveBeenCalledTimes(1);
    expect(mockInventory.unequipItem).toHaveBeenCalledWith(2);
    expect((render as any).displayInventory).toHaveBeenCalledTimes(1);
    expect((render as any).displayEquipped).toHaveBeenCalledTimes(1);
  });

  it('unequip propagates errors from inventory.unequipItem and does not refresh displays', () => {
    const throwing = () => {
      throw new Error('unequip failed');
    };
    const { render, mockInventory } = createRenderingWithMocks({
      unequip: throwing,
    });

    expect(() => render.unequip(5)).toThrowError('unequip failed');
    expect(mockInventory.unequipItem).toHaveBeenCalledTimes(1);
    expect((render as any).displayInventory).not.toHaveBeenCalled();
    expect((render as any).displayEquipped).not.toHaveBeenCalled();
  });

  it('pickUp calls inventory.addItem with name and category and refreshes displays', () => {
    const { render, mockInventory } = createRenderingWithMocks();
    render.pickUp('Key', 'Tool');

    expect(mockInventory.addItem).toHaveBeenCalledTimes(1);
    expect(mockInventory.addItem).toHaveBeenCalledWith('Key', 'Tool');
    expect((render as any).displayInventory).toHaveBeenCalledTimes(1);
    expect((render as any).displayEquipped).toHaveBeenCalledTimes(1);
  });

  it('pickUp propagates errors from inventory.addItem and does not refresh displays', () => {
    const throwing = () => {
      throw new Error('add failed');
    };
    const { render, mockInventory } = createRenderingWithMocks({
      add: throwing,
    });

    expect(() => render.pickUp('Map', 'Paper')).toThrowError('add failed');
    expect(mockInventory.addItem).toHaveBeenCalledTimes(1);
    expect((render as any).displayInventory).not.toHaveBeenCalled();
    expect((render as any).displayEquipped).not.toHaveBeenCalled();
  });

  it('drop calls inventory.removeItem with index and refreshes displays', () => {
    const { render, mockInventory } = createRenderingWithMocks();
    render.drop(4);

    expect(mockInventory.removeItem).toHaveBeenCalledTimes(1);
    expect(mockInventory.removeItem).toHaveBeenCalledWith(4);
    expect((render as any).displayInventory).toHaveBeenCalledTimes(1);
    expect((render as any).displayEquipped).toHaveBeenCalledTimes(1);
  });

  it('drop propagates errors from inventory.removeItem and does not refresh displays', () => {
    const throwing = () => {
      throw new Error('remove failed');
    };
    const { render, mockInventory } = createRenderingWithMocks({
      remove: throwing,
    });

    expect(() => render.drop(0)).toThrowError('remove failed');
    expect(mockInventory.removeItem).toHaveBeenCalledTimes(1);
    expect((render as any).displayInventory).not.toHaveBeenCalled();
    expect((render as any).displayEquipped).not.toHaveBeenCalled();
  });
});

describe('Inventory', () => {
  let inv: Inventory;

  beforeEach(() => {
    inv = new Inventory();
  });

  it('addItem should add an item when under maxItems', () => {
    inv.items = []; // ensure empty
    inv.addItem('Sword', 'Weapon');

    expect(inv.items.length).toBe(1);
    expect((inv.items[0] as any).name).toBe('Sword');
  });

  it('addItem should alert when inventory is full and not add', () => {
    inv.maxItems = 1;
    inv.items = [new Item('Existing', 'Misc', false)];
    const alertSpy = spyOn(window as any, 'alert');

    inv.addItem('Extra', 'Misc');

    expect(inv.items.length).toBe(1);
    expect(alertSpy).toHaveBeenCalledWith('Inventory full');
    alertSpy.and.callThrough();
  });

  it('equipItem should move item from items to equippedItems', () => {
    inv.items = [new Item('Bow', 'Weapon', false)];
    inv.equippedItems = [];

    inv.equipItem(0);

    expect(inv.items.length).toBe(0);
    expect(inv.equippedItems.length).toBe(1);
    expect((inv.equippedItems[0] as any).name).toBe('Bow');
  });

  it('equipItem should alert and not equip when maxEquippedItems reached', () => {
    inv.maxEquippedItems = 1;
    inv.equippedItems = [new Item('Shield', 'Armor', false)];
    inv.items = [new Item('Dagger', 'Weapon', false)];
    const alertSpy = spyOn(window as any, 'alert');

    inv.equipItem(0);

    // item should remain in items, not moved
    expect(inv.items.length).toBe(1);
    expect(inv.equippedItems.length).toBe(1);
    expect(alertSpy).toHaveBeenCalledWith('Cannot equip more items');
    alertSpy.and.callThrough();
  });

  it('unequipItem should move item from equippedItems back to items', () => {
    inv.equippedItems = [new Item('Helmet', 'Armor', false)];
    inv.items = [];

    inv.unequipItem(0);

    expect(inv.equippedItems.length).toBe(0);
    expect(inv.items.length).toBe(1);
    expect((inv.items[0] as any).name).toBe('Helmet');
  });

  it('unequipItem with invalid index should do nothing', () => {
    inv.equippedItems = [];
    inv.items = [new Item('Potion', 'Consumable', false)];

    inv.unequipItem(5); // no error expected

    expect(inv.items.length).toBe(1);
    expect(inv.equippedItems.length).toBe(0);
    expect((inv.items[0] as any).name).toBe('Potion');
  });

  it('removeItem should remove the correct item by index', () => {
    inv.items = [
      new Item('First', 'Misc', false),
      new Item('Second', 'Misc', false),
    ];

    inv.removeItem(0);

    expect(inv.items.length).toBe(1);
    expect((inv.items[0] as any).name).toBe('Second');
  });

  it('getItems and getEquippedItems should return the internal arrays', () => {
    inv.items = [new Item('A', 'X', false)];
    inv.equippedItems = [new Item('B', 'Y', false)];

    expect(inv.getItems()).toBe(inv.items);
    expect(inv.getEquippedItems()).toBe(inv.equippedItems);
  });
});

describe('Item', () => {
  it('creates an instance with provided values', () => {
    const item = new Item('Master Key', 'Tool', true);
    expect(item).toBeInstanceOf(Item);
    expect(item.name).toBe('Master Key');
    expect(item.category).toBe('Tool');
    expect(item.displayed).toBe(true);
  });

  it('accepts false for displayed and empty strings for name/category', () => {
    const item = new Item('', '', false);
    expect(item.name).toBe('');
    expect(item.category).toBe('');
    expect(item.displayed).toBe(false);
  });

  it('allows properties to be updated after creation', () => {
    const item = new Item('Map', 'Navigation', true);
    item.name = 'Treasure Map';
    item.category = 'Quest';
    item.displayed = false;
    expect(item.name).toBe('Treasure Map');
    expect(item.category).toBe('Quest');
    expect(item.displayed).toBe(false);
  });
});
