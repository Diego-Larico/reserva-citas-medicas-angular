import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HitorialComponent } from './hitorial.component';

describe('HitorialComponent', () => {
  let component: HitorialComponent;
  let fixture: ComponentFixture<HitorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HitorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HitorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
