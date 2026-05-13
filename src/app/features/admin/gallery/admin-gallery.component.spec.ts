import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminGalleryComponent } from './admin-gallery.component';
import { provideHttpClient } from '@angular/common/http';

describe('AdminGalleryComponent', () => {
  let fixture: ComponentFixture<AdminGalleryComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminGalleryComponent],
      providers: [provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminGalleryComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
