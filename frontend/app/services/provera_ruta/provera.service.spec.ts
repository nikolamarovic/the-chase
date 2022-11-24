import { TestBed } from '@angular/core/testing';

import { ProveraService } from './provera.service';

describe('ProveraService', () => {
  let service: ProveraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProveraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
