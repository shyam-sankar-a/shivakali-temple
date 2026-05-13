import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  auth   = inject(AuthService);
  router = inject(Router);
  sidebarOpen = signal(true);

  navItems = [
    { label: 'Dashboard',     icon: '📊', path: '/admin/dashboard' },
    { label: 'Bookings',      icon: '📋', path: '/admin/bookings' },
    { label: 'Poojas',        icon: '🪔', path: '/admin/poojas' },
    { label: 'Deities',       icon: '🙏', path: '/admin/deities' },
    { label: 'Gallery',       icon: '🖼️', path: '/admin/gallery' },
    { label: 'Employees',     icon: '👥', path: '/admin/employees' },
    { label: 'Events',        icon: '🎊', path: '/admin/events' },
    { label: 'Audit & Finance', icon: '📈', path: '/admin/audit' },
    { label: 'Temple Info',   icon: '🏛️', path: '/admin/temple-info' },
    { label: 'Admin Users',   icon: '🔐', path: '/admin/users' },
  ];

  logout() {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
