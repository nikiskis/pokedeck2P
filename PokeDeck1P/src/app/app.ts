import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; 
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title() { return 'Ecommerce XML'; }
}