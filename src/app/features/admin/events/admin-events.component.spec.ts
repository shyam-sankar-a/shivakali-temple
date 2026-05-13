import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEventsComponent } from './admin-events.component';
import { provideHttpClient } from '@angular/common/http';

describe('AdminEventsComponent', () => {
  let fixture: ComponentFixture<AdminEventsComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEventsComponent],
      providers: [provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminEventsComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
