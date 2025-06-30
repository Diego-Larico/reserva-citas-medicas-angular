import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarEspecialidadesAdminComponent } from './gestionar-especialidades-admin.component';

describe('GestionarEspecialidadesAdminComponent', () => {
  let component: GestionarEspecialidadesAdminComponent;
  let fixture: ComponentFixture<GestionarEspecialidadesAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarEspecialidadesAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionarEspecialidadesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
