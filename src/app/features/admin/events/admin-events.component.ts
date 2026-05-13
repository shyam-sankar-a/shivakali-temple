import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TempleEvent } from '../../../core/models/models';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-events.component.html',
  styleUrl: './admin-events.component.scss',
})
export class AdminEventsComponent implements OnInit {
  private http = inject(HttpClient);
  events = signal<TempleEvent[]>([]);
  showForm = signal(false);
  editing = signal<TempleEvent | null>(null);
  form = { title: '', description: '', startDate: '', endDate: '', imageUrl: '', isHighlight: false, isVisible: true };

  ngOnInit() { this.load(); }
  load() { this.http.get<TempleEvent[]>(`${environment.apiUrl}/admin/events`).subscribe({ next: e => this.events.set(e) }); }
  openAdd() { this.form = { title: '', description: '', startDate: '', endDate: '', imageUrl: '', isHighlight: false, isVisible: true }; this.editing.set(null); this.showForm.set(true); }
  openEdit(event: TempleEvent) {
    this.form = {
      title: event.title,
      description: event.description,
      startDate: event.startDate ? event.startDate.slice(0, 10) : '',
      endDate: event.endDate ? event.endDate.slice(0, 10) : '',
      imageUrl: event.imageUrl || '',
      isHighlight: event.isHighlight,
      isVisible: true,
    };
    this.editing.set(event);
    this.showForm.set(true);
  }
  closeForm() { this.showForm.set(false); }
  save() {
    const req = this.editing()
      ? this.http.put(`${environment.apiUrl}/admin/events/${this.editing()!._id}`, this.form)
      : this.http.post(`${environment.apiUrl}/admin/events`, this.form);
    req.subscribe({ next: () => { this.load(); this.closeForm(); } });
  }
  delete(id: string) {
    if (!confirm('Delete this event?')) return;
    this.http.delete(`${environment.apiUrl}/admin/events/${id}`).subscribe({ next: () => this.load() });
  }
}
