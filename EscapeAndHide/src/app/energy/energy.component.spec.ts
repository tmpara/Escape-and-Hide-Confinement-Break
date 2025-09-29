import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyComponent } from './energy.component';

describe('HealthComponent', () => {
  let component: EnergyComponent;
  let fixture: ComponentFixture<EnergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnergyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
