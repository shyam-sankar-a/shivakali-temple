import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEmployeesComponent } from './admin-employees.component';
import { provideHttpClient } from '@angular/common/http';

describe('AdminEmployeesComponent', () => {
  let fixture: ComponentFixture<AdminEmployeesComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEmployeesComponent],
      providers: [provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminEmployeesComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
