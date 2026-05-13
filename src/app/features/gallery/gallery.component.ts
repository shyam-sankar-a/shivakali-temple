import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GalleryImage } from '../../core/models/models';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit {
  private http = inject(HttpClient);
  images = signal<GalleryImage[]>([]);
  filtered = signal<GalleryImage[]>([]);
  activeCategory = signal('all');
  lightboxImg = signal<string | null>(null);
  loading = signal(true);

  categories = ['all', 'festival', 'deity', 'temple', 'devotees', 'other'];

  ngOnInit() {
    this.http.get<GalleryImage[]>(`${environment.apiUrl}/public/gallery`).subscribe({
      next: imgs => { this.images.set(imgs); this.filtered.set(imgs); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  filter(category: string) {
    this.activeCategory.set(category);
    this.filtered.set(category === 'all' ? this.images() : this.images().filter(i => i.category === category));
  }

  openLightbox(url: string) { this.lightboxImg.set(url); }
  closeLightbox() { this.lightboxImg.set(null); }
}
