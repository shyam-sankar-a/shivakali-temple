import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminBookingsComponent } from './admin-bookings.component';
import { provideHttpClient } from '@angular/common/http';

describe('AdminBookingsComponent', () => {
  let fixture: ComponentFixture<AdminBookingsComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBookingsComponent],
      providers: [provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminBookingsComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
