import { TestBed } from '@angular/core/testing';

import { D0Service } from './d0.service';

describe('D0Service', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: D0Service = TestBed.get(D0Service);
    expect(service).toBeTruthy();
  });
});
