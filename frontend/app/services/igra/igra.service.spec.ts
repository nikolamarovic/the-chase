import { TestBed } from '@angular/core/testing';

import { IgraService } from './igra.service';

describe('IgraService', () => {
  let service: IgraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IgraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
