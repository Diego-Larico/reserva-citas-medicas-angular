import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiAgendaMedicoComponent } from './mi-agenda-medico.component';

describe('MiAgendaMedicoComponent', () => {
  let component: MiAgendaMedicoComponent;
  let fixture: ComponentFixture<MiAgendaMedicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiAgendaMedicoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MiAgendaMedicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
