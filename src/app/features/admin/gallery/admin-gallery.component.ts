import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GalleryImage } from '../../../core/models/models';

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-gallery.component.html',
  styleUrl: './admin-gallery.component.scss',
})
export class AdminGalleryComponent implements OnInit {
  private http = inject(HttpClient);
  images    = signal<GalleryImage[]>([]);
  showForm  = signal(false);
  editing   = signal<GalleryImage | null>(null);
  uploading = signal(false);
  form = { title: '', imageUrl: '', publicId: '', category: 'other', isVisible: true, sortOrder: 0 };

  categories = ['festival', 'deity', 'temple', 'devotees', 'other'];

  ngOnInit() { this.load(); }

  load() {
    this.http.get<GalleryImage[]>(`${environment.apiUrl}/admin/gallery`).subscribe({ next: i => this.images.set(i) });
  }

  openAdd() {
    this.form = { title: '', imageUrl: '', publicId: '', category: 'other', isVisible: true, sortOrder: 0 };
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(img: GalleryImage) {
    this.form = { title: img.title || '', imageUrl: img.imageUrl, publicId: (img as any).publicId || '', category: img.category, isVisible: img.isVisible, sortOrder: 0 };
    this.editing.set(img);
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('folder', 'gallery');
    this.http.post<{ url: string; publicId: string }>(`${environment.apiUrl}/upload`, fd).subscribe({
      next: res => { this.form.imageUrl = res.url; this.form.publicId = res.publicId; this.uploading.set(false); },
      error: () => this.uploading.set(false),
    });
  }

  save() {
    const req = this.editing()
      ? this.http.put(`${environment.apiUrl}/admin/gallery/${this.editing()!._id}`, this.form)
      : this.http.post(`${environment.apiUrl}/admin/gallery`, this.form);
    req.subscribe({ next: () => { this.load(); this.closeForm(); } });
  }

  delete(id: string) {
    if (!confirm('Delete this image?')) return;
    this.http.delete(`${environment.apiUrl}/admin/gallery/${id}`).subscribe({ next: () => this.load() });
  }
}
