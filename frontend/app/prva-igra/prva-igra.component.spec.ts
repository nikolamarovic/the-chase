import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrvaIgraComponent } from './prva-igra.component';

describe('PrvaIgraComponent', () => {
  let component: PrvaIgraComponent;
  let fixture: ComponentFixture<PrvaIgraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrvaIgraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrvaIgraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
