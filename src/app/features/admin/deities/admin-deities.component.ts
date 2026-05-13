import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Deity } from '../../../core/models/models';

@Component({
  selector: 'app-admin-deities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-deities.component.html',
  styleUrl: './admin-deities.component.scss',
})
export class AdminDeitiesComponent implements OnInit {
  private http = inject(HttpClient);

  deities = signal<Deity[]>([]);
  showForm = signal(false);
  editing = signal<Deity | null>(null);

  form = { name: '', description: '', iconEmoji: '🙏', isActive: true, sortOrder: 0 };

  ngOnInit() { this.load(); }

  load() {
    this.http.get<Deity[]>(`${environment.apiUrl}/admin/deities`).subscribe({
      next: d => this.deities.set(d),
    });
  }

  openAdd() {
    this.form = { name: '', description: '', iconEmoji: '🙏', isActive: true, sortOrder: 0 };
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(deity: Deity) {
    this.form = { name: deity.name, description: deity.description || '', iconEmoji: deity.iconEmoji || '🙏', isActive: deity.isActive, sortOrder: deity.sortOrder || 0 };
    this.editing.set(deity);
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  save() {
    const req = this.editing()
      ? this.http.put(`${environment.apiUrl}/admin/deities/${this.editing()!._id}`, this.form)
      : this.http.post(`${environment.apiUrl}/admin/deities`, this.form);
    req.subscribe({ next: () => { this.load(); this.closeForm(); } });
  }

  delete(id: string) {
    if (!confirm('Delete this deity?')) return;
    this.http.delete(`${environment.apiUrl}/admin/deities/${id}`).subscribe({ next: () => this.load() });
  }
}
