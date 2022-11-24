import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugaIgraComponent } from './druga-igra.component';

describe('DrugaIgraComponent', () => {
  let component: DrugaIgraComponent;
  let fixture: ComponentFixture<DrugaIgraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrugaIgraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugaIgraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
