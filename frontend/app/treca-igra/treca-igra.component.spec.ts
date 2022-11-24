import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrecaIgraComponent } from './treca-igra.component';

describe('TrecaIgraComponent', () => {
  let component: TrecaIgraComponent;
  let fixture: ComponentFixture<TrecaIgraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrecaIgraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrecaIgraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
