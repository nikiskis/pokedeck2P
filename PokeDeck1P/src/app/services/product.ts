import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  
  private apiUrl = 'http://189.163.49.6:4000/api/catalogo';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/producto`);
  }

  updateStock(id: number, stock: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/producto/${id}/stock`, { stock });
  }

  updateProductFull(id: number, productData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/producto/${id}`, productData);
  }

  createProduct(productData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/producto`, productData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/producto/${id}`);
  }

  // Nuevo método
  activateProduct(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/producto/${id}/activate`, {});
  }
}