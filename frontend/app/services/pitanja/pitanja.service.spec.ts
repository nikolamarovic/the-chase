import { TestBed } from '@angular/core/testing';

import { PitanjaService } from './pitanja.service';

describe('PitanjaService', () => {
  let service: PitanjaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PitanjaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
