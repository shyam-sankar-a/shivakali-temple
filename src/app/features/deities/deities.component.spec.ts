import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeitiesComponent } from './deities.component';
import { provideRouter } from '@angular/router';

describe('DeitiesComponent', () => {
  let fixture: ComponentFixture<DeitiesComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeitiesComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(DeitiesComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
