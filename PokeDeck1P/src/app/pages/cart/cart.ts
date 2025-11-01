import { Component } from '@angular/core';
import { CommonModule, DecimalPipe, NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { CartItem } from '../../models/cart-item';
import { CartService } from '../../services/cart'; 

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, DecimalPipe, RouterLink, NavbarComponent],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent {
  items: CartItem[] = [];

  constructor(private cart: CartService) {
    this.cart.items$?.subscribe?.(items => this.items = items) ?? (this.items = this.cart.items ?? []);
  }

  remove(id: number) { this.cart.remove(id); }

  updateQty(id: number, q: string) {
    const qty = Math.max(0, Number(q) || 0);
    this.cart.updateQuantity(id, qty);
  }

  total() { return this.cart.getTotal(); }
}
