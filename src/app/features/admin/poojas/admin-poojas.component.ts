import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pooja } from '../../../core/models/models';

@Component({
  selector: 'app-admin-poojas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-poojas.component.html',
  styleUrl: './admin-poojas.component.scss',
})
export class AdminPoojasComponent implements OnInit {
  private http = inject(HttpClient);
  poojas = signal<Pooja[]>([]);
  showForm = signal(false);
  editing = signal<Pooja | null>(null);

  form = { name: '', description: '', duration: '', price: 0, deity: 'Both', timings: '', isActive: true };

  ngOnInit() { this.load(); }

  load() {
    this.http.get<Pooja[]>(`${environment.apiUrl}/admin/poojas`).subscribe({ next: p => this.poojas.set(p) });
  }

  openAdd() { this.form = { name: '', description: '', duration: '', price: 0, deity: 'Both', timings: '', isActive: true }; this.editing.set(null); this.showForm.set(true); }
  openEdit(pooja: Pooja) { this.form = { ...pooja, timings: pooja.timings.join(', ') }; this.editing.set(pooja); this.showForm.set(true); }
  closeForm() { this.showForm.set(false); }

  save() {
    const payload = { ...this.form, timings: this.form.timings.split(',').map(t => t.trim()).filter(Boolean) };
    const req = this.editing()
      ? this.http.put(`${environment.apiUrl}/admin/poojas/${this.editing()!._id}`, payload)
      : this.http.post(`${environment.apiUrl}/admin/poojas`, payload);
    req.subscribe({ next: () => { this.load(); this.closeForm(); } });
  }

  delete(id: string) {
    if (!confirm('Delete this pooja?')) return;
    this.http.delete(`${environment.apiUrl}/admin/poojas/${id}`).subscribe({ next: () => this.load() });
  }
}
