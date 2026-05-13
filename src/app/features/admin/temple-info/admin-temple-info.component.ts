import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-temple-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-temple-info.component.html',
  styleUrl: './admin-temple-info.component.scss',
})
export class AdminTempleInfoComponent implements OnInit {
  private http = inject(HttpClient);
  saved         = signal(false);
  uploadingHero = signal(false);

  info: Record<string, any> = {
    templeName:    'Shivakali Amba Bhagavathi Temple',
    address:       'Haripad, Alappuzha District, Kerala — 690514',
    phone:         '',
    email:         '',
    bankName:      'State Bank of India',
    accountNo:     '',
    ifscCode:      '',
    upiId:         '',
    mapEmbedUrl:   '',
    heroImageUrl:  '',
    heroPublicId:  '',
  };

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/admin/temple-info`).subscribe({
      next: data => { this.info = { ...this.info, ...data }; },
    });
  }

  onHeroSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingHero.set(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('folder', 'hero');
    this.http.post<{ url: string; publicId: string }>(`${environment.apiUrl}/upload`, fd).subscribe({
      next: res => {
        this.info['heroImageUrl'] = res.url;
        this.info['heroPublicId'] = res.publicId;
        this.uploadingHero.set(false);
      },
      error: () => this.uploadingHero.set(false),
    });
  }

  save() {
    this.http.put(`${environment.apiUrl}/admin/temple-info`, this.info).subscribe({
      next: () => { this.saved.set(true); setTimeout(() => this.saved.set(false), 3000); },
    });
  }
}
