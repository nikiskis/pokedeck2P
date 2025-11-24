import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { User } from '../models/user';
import { HttpClient } from '@angular/common/http'; 
import { Order } from '../models/order'; 

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  private apiUrl = 'http://189.163.49.6:4000/api/auth'; 
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {} 

  register(nombre: string, email: string, contrasena: string, direccion: string, pregunta1: number, respuesta1: string, pregunta2: number, respuesta2: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, {
      nombre, email, contrasena, direccion, pregunta1, respuesta1, pregunta2, respuesta2
    }).pipe(
      tap(user => { this.currentUserSubject.next(user); }),
      catchError(this.handleError) 
    );
  }

  login(email: string, contrasena: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, contrasena }).pipe(
      tap(user => { this.currentUserSubject.next(user); }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }

  updateUser(user: any): Observable<User> {
    const url = `${this.apiUrl}/user/${user.id}`;
    return this.http.put<User>(url, { 
      nombre: user.nombre, 
      email: user.email, 
      direccion: user.direccion,
      pregunta1: user.pregunta1,
      respuesta1: user.respuesta1,
      pregunta2: user.pregunta2,
      respuesta2: user.respuesta2
    }).pipe(
      tap(updatedUser => { this.currentUserSubject.next(updatedUser); }),
      catchError(this.handleError)
    );
  }

  deleteUser(userId: number): Observable<any> {
    const url = `${this.apiUrl}/user/${userId}`;
    return this.http.delete(url).pipe(
      tap(() => { this.logout(); }),
      catchError(this.handleError)
    );
  }
  
  getOrderHistory(userId: number): Observable<Order[]> {
    const url = `${this.apiUrl}/history/${userId}`;
    return this.http.get<Order[]>(url).pipe(catchError(this.handleError));
  }

  
  getSecurityQuestions(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/security-questions`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(email: string, respuesta1: string, respuesta2: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, respuesta1, respuesta2, nuevaContrasena }).pipe(
      catchError(this.handleError)
    );
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private handleError(error: any) {
    console.error('Error en AuthService:', error);
    return throwError(() => new Error(error.error?.error || 'Error del servidor'));
  }
}