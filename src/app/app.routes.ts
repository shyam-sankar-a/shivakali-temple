import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'deities', loadComponent: () => import('./features/deities/deities.component').then(m => m.DeitiesComponent) },
  { path: 'events', loadComponent: () => import('./features/events/events.component').then(m => m.EventsComponent) },
  { path: 'gallery', loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent) },
  { path: 'donations', loadComponent: () => import('./features/donations/donations.component').then(m => m.DonationsComponent) },
  { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'book-pooja', loadComponent: () => import('./features/book-pooja/book-pooja.component').then(m => m.BookPoojaComponent) },
  { path: 'payment', loadComponent: () => import('./features/payment/payment.component').then(m => m.PaymentComponent) },
  {
    path: 'admin',
    children: [
      { path: 'login', loadComponent: () => import('./features/admin/login/admin-login.component').then(m => m.AdminLoginComponent) },
      {
        path: '',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
          { path: 'bookings', loadComponent: () => import('./features/admin/bookings/admin-bookings.component').then(m => m.AdminBookingsComponent) },
          { path: 'poojas', loadComponent: () => import('./features/admin/poojas/admin-poojas.component').then(m => m.AdminPoojasComponent) },
          { path: 'gallery', loadComponent: () => import('./features/admin/gallery/admin-gallery.component').then(m => m.AdminGalleryComponent) },
          { path: 'employees', loadComponent: () => import('./features/admin/employees/admin-employees.component').then(m => m.AdminEmployeesComponent) },
          { path: 'events', loadComponent: () => import('./features/admin/events/admin-events.component').then(m => m.AdminEventsComponent) },
          { path: 'deities', loadComponent: () => import('./features/admin/deities/admin-deities.component').then(m => m.AdminDeitiesComponent) },
          { path: 'audit', loadComponent: () => import('./features/admin/audit/admin-audit.component').then(m => m.AdminAuditComponent) },
          { path: 'temple-info', loadComponent: () => import('./features/admin/temple-info/admin-temple-info.component').then(m => m.AdminTempleInfoComponent) },
          { path: 'users', loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent) },
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
