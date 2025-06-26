import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wuwa_charactersComponent } from './wuwa_characters.component';

describe('CharactersComponent', () => {
  let component: Wuwa_charactersComponent;
  let fixture: ComponentFixture<Wuwa_charactersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wuwa_charactersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Wuwa_charactersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
