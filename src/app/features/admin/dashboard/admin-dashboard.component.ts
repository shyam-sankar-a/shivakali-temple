import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  stats = signal<any>(null);
  recentBookings = signal<any[]>([]);

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/admin/stats`).subscribe({ next: s => this.stats.set(s), error: () => {} });
    this.http.get<any[]>(`${environment.apiUrl}/admin/bookings`).subscribe({ next: b => this.recentBookings.set(b.slice(0, 5)), error: () => {} });
  }
}
