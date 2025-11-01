import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, NgIf, NgFor } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product'; 

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, DecimalPipe, NavbarComponent],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error = '';

  constructor(
    private productService: ProductService, 
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (prods) => { 
        this.products = prods; 
        this.loading = false; 
      },
      error: () => { 
        this.error = 'No se pudieron cargar los productos desde la API.'; 
        this.loading = false; 
      }
    });
  }

  addToCart(p: Product) {
    this.cartService.add(p, 1);
  }
}