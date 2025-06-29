import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisPacientesMedicoComponent } from './mis-pacientes-medico.component';

describe('MisPacientesMedicoComponent', () => {
  let component: MisPacientesMedicoComponent;
  let fixture: ComponentFixture<MisPacientesMedicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisPacientesMedicoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MisPacientesMedicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
