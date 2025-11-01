import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms'; 
import { AuthService } from '../../services/auth'; 
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  registerForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      direccion: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.error = '';
    const { nombre, email, contrasena, direccion } = this.registerForm.value;

    this.authService.register(nombre, email, contrasena, direccion).subscribe({
      next: (user) => {
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al registrar la cuenta.';
      }
    });
  }

  get nombre() { return this.registerForm.get('nombre'); }
  get email() { return this.registerForm.get('email'); }
  get contrasena() { return this.registerForm.get('contrasena'); }
  get direccion() { return this.registerForm.get('direccion'); }
}