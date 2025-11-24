import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [NavbarComponent, RouterLink],
  templateUrl: './legal.html',
  styleUrls: ['./legal.css']
})
export class LegalComponent {}