import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AdminUser } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);
  users = signal<AdminUser[]>([]);
  showForm = signal(false);
  form = { name: '', email: '', password: '' };

  ngOnInit() { this.load(); }
  load() { this.http.get<AdminUser[]>(`${environment.apiUrl}/admin/users`).subscribe({ next: u => this.users.set(u) }); }

  toggleStatus(user: AdminUser) {
    const status = user.adminStatus === 'active' ? 'inactive' : 'active';
    this.http.patch(`${environment.apiUrl}/admin/users/${user._id}/status`, { adminStatus: status }).subscribe({ next: () => this.load() });
  }

  createAdmin() {
    this.http.post(`${environment.apiUrl}/admin/users`, this.form).subscribe({
      next: () => { this.form = { name: '', email: '', password: '' }; this.showForm.set(false); this.load(); },
    });
  }
}
