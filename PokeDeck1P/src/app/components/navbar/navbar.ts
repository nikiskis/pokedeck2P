import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth'; 
import { User } from '../../models/user'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnDestroy {
  
  currentUser: User | null = null;
  private authSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}