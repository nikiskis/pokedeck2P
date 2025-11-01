import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  
  private apiUrl = 'http://localhost:4000/api/catalogo/producto';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

}