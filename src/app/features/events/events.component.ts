import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TempleEvent } from '../../core/models/models';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
})
export class EventsComponent implements OnInit {
  private http = inject(HttpClient);
  events = signal<TempleEvent[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.http.get<TempleEvent[]>(`${environment.apiUrl}/public/events`).subscribe({
      next: e => { this.events.set(e); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  upcoming(events: TempleEvent[]) { return events.filter(e => new Date(e.startDate) >= new Date()); }
  past(events: TempleEvent[]) { return events.filter(e => new Date(e.startDate) < new Date()); }
}
