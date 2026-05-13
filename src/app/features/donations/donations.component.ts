import { Component } from '@angular/core';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [],
  templateUrl: './donations.component.html',
  styleUrl: './donations.component.scss',
})
export class DonationsComponent {
  causes = [
    { icon: '🪔', title: 'Daily Pooja & Rituals', description: 'Support the daily ritual expenses including flowers, lamps, incense and offering materials.' },
    { icon: '🏛️', title: 'Temple Renovation', description: 'Help maintain and restore the ancient temple structure, preserving its heritage for future generations.' },
    { icon: '🎊', title: 'Festival Celebrations', description: 'Contribute to grand festivals like Navratri, Kali Puja and the annual Ulsavam.' },
    { icon: '🧑‍🤝‍🧑', title: 'Community Service', description: 'Support free meals (Annadanam), educational scholarships and community welfare programs.' },
  ];
}
