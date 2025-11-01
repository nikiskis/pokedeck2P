import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  add(product: Product, quantity = 1): void {
    const items = [...this.items];
    const idx = items.findIndex(i => i.product.id === product.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + quantity };
    } else {
      items.push({ product, quantity });
    }
    this.itemsSubject.next(items);
  }

  remove(productId: number): void {
    const items = this.items.filter(i => i.product.id !== productId);
    this.itemsSubject.next(items);
  }

  updateQuantity(productId: number, quantity: number): void {
    const items = this.items.map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    ).filter(i => i.quantity > 0);
    this.itemsSubject.next(items);
  }

  clear(): void {
    this.itemsSubject.next([]);
  }

  getTotal(): number {
    return this.items.reduce((sum, i) => sum + i.product.precio * i.quantity, 0);
  }
}
