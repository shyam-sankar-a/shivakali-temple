import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface AuthResponse { token: string; user: any; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  currentUser = signal<any>(this.loadUser());

  private loadUser() {
    const t = localStorage.getItem('temple_token');
    if (!t) return null;
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload;
    } catch { return null; }
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('temple_token', res.token);
        this.currentUser.set(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('temple_token');
    this.currentUser.set(null);
  }

  getToken() { return localStorage.getItem('temple_token'); }

  isAdmin() {
    const u = this.currentUser();
    return u && ['admin', 'superadmin'].includes(u.role);
  }

  isSuperAdmin() { return this.currentUser()?.role === 'superadmin'; }
}
