import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth'; 
import { User } from '../../models/user';
import { Observable, Subscription } from 'rxjs';
import { Order } from '../../models/order'; 
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms'; 
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
 selector: 'app-profile',
 standalone: true,
 imports: [CommonModule, ReactiveFormsModule, NavbarComponent], 
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

    constructor(
        private authService: AuthService, 
        private fb: FormBuilder,
        private router: Router
    ) {
        this.user$ = this.authService.currentUser$;
        
        this.userSubscription = this.user$.subscribe(user => {
            this.currentUser = user;
            if (user) {
                this.initForm(user);
                this.loadOrderHistory(user.id); 
            } else {
                this.orderHistory = [];
            }
        });
    }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    loadOrderHistory(userId: number): void {
        this.authService.getOrderHistory(userId).subscribe({
            next: (orders) => {
                this.orderHistory = orders;
            },
            error: (err) => {
                console.error("Fallo al cargar historial:", err);
            }
        });
    }

    initForm(user: User): void {
        this.editForm = this.fb.group({
            nombre: [user.nombre, [Validators.required]],
            email: [user.email, [Validators.required, Validators.email]],
            direccion: [user.direccion, [Validators.required]]
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
        if (this.editForm.invalid || !this.currentUser) return;

        this.error = '';
        const updatedData: User = {
            ...this.currentUser, 
            ...this.editForm.value 
        };

        this.authService.updateUser(updatedData).subscribe({
            next: (user) => {
                console.log('Usuario actualizado:', user);
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
                next: () => {
                    this.router.navigate(['/register']); 
                },
                error: (err) => {
                    this.error = err.message || 'Error al eliminar la cuenta.';
                }
            });
        }
    }

    get nombre() { return this.editForm.get('nombre'); }
    get email() { return this.editForm.get('email'); }
    get direccion() { return this.editForm.get('direccion'); }
}