import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookPoojaComponent } from './book-pooja.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('BookPoojaComponent', () => {
  let fixture: ComponentFixture<BookPoojaComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookPoojaComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(BookPoojaComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
