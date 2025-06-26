import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wuwa_tasksComponent } from './wuwa_tasks.component';

describe('TasksComponent', () => {
  let component: Wuwa_tasksComponent;
  let fixture: ComponentFixture<Wuwa_tasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wuwa_tasksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Wuwa_tasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
