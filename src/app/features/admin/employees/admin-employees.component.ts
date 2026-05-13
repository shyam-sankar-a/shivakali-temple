import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Employee } from '../../../core/models/models';

@Component({
  selector: 'app-admin-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-employees.component.html',
  styleUrl: './admin-employees.component.scss',
})
export class AdminEmployeesComponent implements OnInit {
  private http = inject(HttpClient);
  employees = signal<Employee[]>([]);
  showForm = signal(false);
  editing = signal<Employee | null>(null);
  form = { name: '', role: '', description: '', imageUrl: '', phone: '', email: '', isVisible: true, sortOrder: 0 };

  ngOnInit() { this.load(); }
  load() { this.http.get<Employee[]>(`${environment.apiUrl}/admin/employees`).subscribe({ next: e => this.employees.set(e) }); }
  openAdd() { this.form = { name: '', role: '', description: '', imageUrl: '', phone: '', email: '', isVisible: true, sortOrder: 0 }; this.editing.set(null); this.showForm.set(true); }
  openEdit(emp: Employee) { this.form = { name: emp.name, role: emp.role, description: emp.description, imageUrl: emp.imageUrl || '', phone: emp.phone || '', email: emp.email || '', isVisible: true, sortOrder: 0 }; this.editing.set(emp); this.showForm.set(true); }
  closeForm() { this.showForm.set(false); }
  save() {
    const req = this.editing()
      ? this.http.put(`${environment.apiUrl}/admin/employees/${this.editing()!._id}`, this.form)
      : this.http.post(`${environment.apiUrl}/admin/employees`, this.form);
    req.subscribe({ next: () => { this.load(); this.closeForm(); } });
  }
  delete(id: string) {
    if (!confirm('Delete this employee?')) return;
    this.http.delete(`${environment.apiUrl}/admin/employees/${id}`).subscribe({ next: () => this.load() });
  }
}
