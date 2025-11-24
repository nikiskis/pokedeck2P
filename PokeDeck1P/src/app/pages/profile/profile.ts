import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth'; 
import { User } from '../../models/user';
import { Observable, Subscription } from 'rxjs';
import { Order } from '../../models/order'; 
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router'; 
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
 selector: 'app-profile',
 standalone: true,
 imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink], 
 templateUrl: './profile.html', 
 styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

    user$: Observable<User | null>;
    currentUser: User | null = null;
    isEditing: boolean = false; 
    editForm!: FormGroup;
    error: string = '';
    private userSubscription: Subscription;
    
    orderHistory: Order[] = []; 

    preguntasSeguridad = [
        { id: 1, texto: '¿Cuál fue el primer Pokémon que elegiste en algún juego de Pokémon?' },
        { id: 2, texto: '¿Qué región del mundo Pokémon es tu favorita (Kanto, Johto, Hoenn, etc.)?' },
        { id: 3, texto: '¿Quién es tu entrenador o personaje favorito del anime Pokémon?' },
        { id: 4, texto: '¿Qué Pokémon te acompañaría si vivieras en el mundo Pokémon?' },
        { id: 5, texto: '¿Cuál fue el primer juego de Pokémon que jugaste?' }
    ];

    constructor(
        private authService: AuthService, 
        private fb: FormBuilder,
        private router: Router
    ) {
        this.user$ = this.authService.currentUser$;
        
        this.userSubscription = this.user$.subscribe(user => {
            this.currentUser = user;
            if (user) {
                this.loadOrderHistory(user.id); 
            } else {
                this.orderHistory = [];
            }
        });
    }

    ngOnInit(): void {}

    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    loadOrderHistory(userId: number): void {
        this.authService.getOrderHistory(userId).subscribe({
            next: (orders) => { this.orderHistory = orders; },
            error: (err) => { console.error("Fallo al cargar historial:", err); }
        });
    }

    initForm(user: User): void {
        this.editForm = this.fb.group({
            nombre: [user.nombre, [Validators.required]],
            email: [user.email, [Validators.required, Validators.email]],
            direccion: [user.direccion, [Validators.required]],
            pregunta1: [user.pregunta1 || '', [Validators.required]],
            respuesta1: [''], 
            pregunta2: [user.pregunta2 || '', [Validators.required]],
            respuesta2: ['']
        });
    }

    enableEdit(): void {
        this.isEditing = true;
        if (this.currentUser) {
             this.initForm(this.currentUser);
        }
        this.error = '';
    }

    cancelEdit(): void {
        this.isEditing = false;
    }

    onUpdate(): void {
        if (this.editForm.invalid || !this.currentUser) {
            this.editForm.markAllAsTouched();
            return;
        }

        const { pregunta1, pregunta2, respuesta1, respuesta2 } = this.editForm.value;

        if (pregunta1 != this.currentUser.pregunta1 && (!respuesta1 || respuesta1.trim() === '')) {
            this.error = "Si cambias la Pregunta 1, debes escribir una nueva respuesta.";
            return;
        }
        if (pregunta2 != this.currentUser.pregunta2 && (!respuesta2 || respuesta2.trim() === '')) {
            this.error = "Si cambias la Pregunta 2, debes escribir una nueva respuesta.";
            return;
        }

        if (pregunta1 == pregunta2) {
            this.error = "Selecciona dos preguntas diferentes.";
            return;
        }

        this.error = '';
        const updatedData = {
            ...this.currentUser, 
            ...this.editForm.value 
        };

        this.authService.updateUser(updatedData).subscribe({
            next: (user) => {
                this.isEditing = false; 
            },
            error: (err) => {
                this.error = err.message || 'Error al actualizar el perfil.';
            }
        });
    }

    onDelete(): void {
        if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')) {
            if (!this.currentUser) return;

            this.authService.deleteUser(this.currentUser.id).subscribe({
                next: () => { this.router.navigate(['/register']); },
                error: (err) => { this.error = err.message || 'Error al eliminar la cuenta.'; }
            });
        }
    }

    get nombre() { return this.editForm.get('nombre'); }
    get email() { return this.editForm.get('email'); }
    get direccion() { return this.editForm.get('direccion'); }
    get f_pregunta1() { return this.editForm.get('pregunta1'); }
    get f_respuesta1() { return this.editForm.get('respuesta1'); }
    get f_pregunta2() { return this.editForm.get('pregunta2'); }
    get f_respuesta2() { return this.editForm.get('respuesta2'); }
}