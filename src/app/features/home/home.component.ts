import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Pooja, TempleEvent } from '../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  poojas  = signal<Pooja[]>([]);
  events  = signal<TempleEvent[]>([]);
  heroUrl = signal<string | null>(null);

  pujaTimings = [
    { time: '5:30 AM', name: 'Nirmalya Darshanam', deity: 'Morning Opening' },
    { time: '6:00 AM', name: 'Usha Pooja',          deity: 'Kali & Durga' },
    { time: '10:00 AM', name: 'Pantheeradi Pooja',  deity: 'Kali & Durga' },
    { time: '12:00 PM', name: 'Uchapooja',           deity: 'Kali & Durga' },
    { time: '5:00 PM',  name: 'Deeparadhana',        deity: 'Kali & Durga' },
    { time: '7:30 PM',  name: 'Athazha Pooja',       deity: 'Kali & Durga' },
    { time: '8:30 PM',  name: 'Thidambu Nritham',    deity: 'Special Evenings' },
  ];

  heroStyle() {
    const url = this.heroUrl();
    if (url) {
      return { backgroundImage: `url('${url}')` };
    }
    return {
      backgroundImage:
        'linear-gradient(160deg, #6B1010 0%, #3D1710 35%, #2A0E06 70%, #1C0804 100%)',
    };
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/public/temple-info`).subscribe({
      next: info => { if (info?.heroImageUrl) this.heroUrl.set(info.heroImageUrl); },
      error: () => {},
    });
    this.http.get<Pooja[]>(`${environment.apiUrl}/public/poojas`).subscribe({
      next: p => this.poojas.set(p.slice(0, 4)),
      error: () => {},
    });
    this.http.get<TempleEvent[]>(`${environment.apiUrl}/public/events`).subscribe({
      next: e => this.events.set(e.filter(ev => new Date(ev.startDate) >= new Date()).slice(0, 3)),
      error: () => {},
    });
  }
}
