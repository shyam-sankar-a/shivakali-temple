import { Component, inject, OnInit, OnDestroy, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardElement') cardElementRef!: ElementRef;

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  bookingId = signal('');
  status = signal('');
  clientSecret = signal('');
  processing = signal(false);
  paymentError = signal('');
  paymentSuccess = signal(false);

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private card: StripeCardElement | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['bookingId']) this.bookingId.set(p['bookingId']);
      if (p['status'])    this.status.set(p['status']);
      if (p['clientSecret']) this.clientSecret.set(p['clientSecret']);
    });
  }

  async ngAfterViewInit() {
    if (!this.clientSecret()) return;

    this.stripe = await loadStripe(environment.stripePublishableKey);
    if (!this.stripe || !this.cardElementRef) return;

    this.elements = this.stripe.elements();
    this.card = this.elements.create('card', {
      style: {
        base: {
          fontFamily: '"Inter", sans-serif',
          fontSize: '16px',
          color: '#2C1A0E',
          '::placeholder': { color: '#8A6A55' },
        },
        invalid: { color: '#C0392B' },
      },
    });
    this.card.mount(this.cardElementRef.nativeElement);

    this.card.on('change', (event) => {
      this.paymentError.set(event.error ? event.error.message : '');
    });
  }

  async pay() {
    if (!this.stripe || !this.card || !this.clientSecret()) return;
    this.processing.set(true);
    this.paymentError.set('');

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret(), {
      payment_method: { card: this.card },
    });

    if (error) {
      this.paymentError.set(error.message ?? 'Payment failed. Please try again.');
      this.processing.set(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      this.http.post(`${environment.apiUrl}/bookings/confirm-payment`, {
        paymentIntentId: paymentIntent.id,
      }).subscribe({
        next: () => {
          this.processing.set(false);
          this.paymentSuccess.set(true);
        },
        error: () => {
          this.processing.set(false);
          this.paymentSuccess.set(true);
        },
      });
    }
  }

  ngOnDestroy() {
    this.card?.destroy();
  }
}
