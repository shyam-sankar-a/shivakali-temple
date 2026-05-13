import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PoojaBooking } from '../../../core/models/models';

type SourceFilter = 'all' | 'online' | 'offline';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bookings.component.html',
  styleUrl: './admin-bookings.component.scss',
})
export class AdminBookingsComponent implements OnInit {
  private http = inject(HttpClient);

  bookings = signal<PoojaBooking[]>([]);
  loading = signal(true);

  sourceFilter = signal<SourceFilter>('all');
  fromDate = '';
  toDate = '';

  filtered = computed(() => {
    const src = this.sourceFilter();
    return this.bookings().filter(b => src === 'all' || b.bookingSource === src);
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    const params = new URLSearchParams();
    if (this.fromDate) params.set('from', this.fromDate);
    if (this.toDate) params.set('to', this.toDate);
    const qs = params.toString() ? '?' + params.toString() : '';
    this.http.get<PoojaBooking[]>(`${environment.apiUrl}/admin/bookings${qs}`).subscribe({
      next: b => { this.bookings.set(b); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setSource(src: SourceFilter) {
    this.sourceFilter.set(src);
  }

  applyDateFilter() {
    this.load();
  }

  clearFilters() {
    this.fromDate = '';
    this.toDate = '';
    this.sourceFilter.set('all');
    this.load();
  }

  updateStatus(id: string, status: string) {
    this.http.patch(`${environment.apiUrl}/admin/bookings/${id}/status`, { status }).subscribe({ next: () => this.load() });
  }
}
