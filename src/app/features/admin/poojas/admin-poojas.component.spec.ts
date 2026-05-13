import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPoojasComponent } from './admin-poojas.component';
import { provideHttpClient } from '@angular/common/http';

describe('AdminPoojasComponent', () => {
  let fixture: ComponentFixture<AdminPoojasComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPoojasComponent],
      providers: [provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminPoojasComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
