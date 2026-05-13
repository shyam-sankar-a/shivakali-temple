import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Pooja, Devotee, Deity, NAKSHATRAS } from '../../core/models/models';

@Component({
  selector: 'app-book-pooja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-pooja.component.html',
  styleUrl: './book-pooja.component.scss',
})
export class BookPoojaComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  poojas = signal<Pooja[]>([]);
  deities = signal<Deity[]>([]);
  selectedPoojas = signal<Pooja[]>([]);
  selectedDeity = signal<Deity | null>(null);
  loading = signal(true);
  submitting = signal(false);
  error = signal('');

  nakshatras = NAKSHATRAS;
  bookedDate = '';
  contactName = '';
  contactEmail = '';
  contactPhone = '';
  paymentMethod: 'online' | 'pay_at_temple' = 'pay_at_temple';
  notes = '';
  devotees: Devotee[] = [{ name: '', nakshatra: '', phone: '' }];

  totalAmount = computed(() =>
    this.selectedPoojas().reduce((sum, p) => sum + p.price, 0)
  );

  hasSelections = computed(() => this.selectedPoojas().length > 0);

  ngOnInit() {
    this.http.get<Pooja[]>(`${environment.apiUrl}/public/poojas`).subscribe({
      next: poojas => {
        this.poojas.set(poojas);
        this.loading.set(false);
        const id = this.route.snapshot.queryParamMap.get('pooja');
        if (id) {
          const found = poojas.find(p => p._id === id);
          if (found) this.selectedPoojas.set([found]);
        }
      },
      error: () => this.loading.set(false),
    });

    this.http.get<Deity[]>(`${environment.apiUrl}/public/deities`).subscribe({
      next: d => this.deities.set(d),
      error: () => {},
    });
  }

  isPoojaSelected(pooja: Pooja): boolean {
    return this.selectedPoojas().some(p => p._id === pooja._id);
  }

  togglePooja(pooja: Pooja) {
    const current = this.selectedPoojas();
    if (this.isPoojaSelected(pooja)) {
      this.selectedPoojas.set(current.filter(p => p._id !== pooja._id));
    } else {
      this.selectedPoojas.set([...current, pooja]);
    }
  }

  selectDeity(deity: Deity | null) {
    this.selectedDeity.set(deity);
  }

  isDeitySelected(deity: Deity): boolean {
    return this.selectedDeity()?._id === deity._id;
  }

  addDevotee() {
    this.devotees.push({ name: '', nakshatra: '', phone: '' });
  }

  removeDevotee(i: number) {
    if (this.devotees.length > 1) this.devotees.splice(i, 1);
  }

  minDate() { return new Date().toISOString().split('T')[0]; }

  submit() {
    const selected = this.selectedPoojas();
    if (!selected.length || !this.bookedDate || !this.contactName || !this.contactPhone) {
      this.error.set('Please fill in all required fields.');
      return;
    }
    if (this.devotees.some(d => !d.name || !d.nakshatra)) {
      this.error.set('Please fill in name and nakshatra for all devotees.');
      return;
    }
    this.error.set('');
    this.submitting.set(true);

    const deity = this.selectedDeity();
    const primaryPooja = selected[0];
    const body: Record<string, unknown> = {
      poojaId: primaryPooja._id,
      extraPoojaIds: selected.slice(1).map(p => p._id),
      bookedDate: this.bookedDate,
      devotees: this.devotees,
      contactName: this.contactName,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      paymentMethod: this.paymentMethod,
      notes: this.notes,
    };
    if (deity) {
      body['deityId'] = deity._id;
      body['deityName'] = deity.name;
    }

    this.http.post<any>(`${environment.apiUrl}/bookings`, body).subscribe({
      next: res => {
        this.submitting.set(false);
        if (this.paymentMethod === 'pay_at_temple') {
          this.router.navigate(['/payment'], { queryParams: { bookingId: res.booking._id, status: 'confirmed' } });
        } else {
          this.router.navigate(['/payment'], { queryParams: { bookingId: res.booking._id, clientSecret: res.clientSecret } });
        }
      },
      error: err => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? 'Booking failed. Please try again.');
      },
    });
  }
}
