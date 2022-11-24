import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangListComponent } from './rang-list.component';

describe('RangListComponent', () => {
  let component: RangListComponent;
  let fixture: ComponentFixture<RangListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RangListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RangListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
