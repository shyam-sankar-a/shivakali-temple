import { Component, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private http      = inject(HttpClient);

  // Default embed for Haripad, Alappuzha — overridden by temple-info if set
  private defaultMapSrc =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3934.!2d76.3896!3d9.2352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0876e1b5a1c5a9%3A0x1!2sHaripad%2C+Kerala!5e0!3m2!1sen!2sin!4v1699000000000!5m2!1sen!2sin';

  mapSrc = signal<SafeResourceUrl>(this.sanitizer.bypassSecurityTrustResourceUrl(this.defaultMapSrc));

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/public/temple-info`).subscribe({
      next: info => {
        if (info?.mapEmbedUrl) {
          this.mapSrc.set(this.sanitizer.bypassSecurityTrustResourceUrl(info.mapEmbedUrl));
        }
      },
      error: () => {},
    });
  }
}
