import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTempleInfoComponent } from './admin-temple-info.component';
import { provideHttpClient } from '@angular/common/http';

describe('AdminTempleInfoComponent', () => {
  let fixture: ComponentFixture<AdminTempleInfoComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTempleInfoComponent],
      providers: [provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminTempleInfoComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
