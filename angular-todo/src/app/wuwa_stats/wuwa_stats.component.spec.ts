import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wuwa_statsComponent } from './wuwa_stats.component';

describe('StatsComponent', () => {
  let component: Wuwa_statsComponent;
  let fixture: ComponentFixture<Wuwa_statsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wuwa_statsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Wuwa_statsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
