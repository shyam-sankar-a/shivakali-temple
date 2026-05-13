import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-deities',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './deities.component.html',
  styleUrl: './deities.component.scss',
})
export class DeitiesComponent {}
