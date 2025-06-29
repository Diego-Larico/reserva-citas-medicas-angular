import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialesMedicosMedicoComponent } from './historiales-medicos-medico.component';

describe('HistorialesMedicosMedicoComponent', () => {
  let component: HistorialesMedicosMedicoComponent;
  let fixture: ComponentFixture<HistorialesMedicosMedicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialesMedicosMedicoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistorialesMedicosMedicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
