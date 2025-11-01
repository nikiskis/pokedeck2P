import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms'; 
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  
  loginForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); 
      return;
    }

    this.error = ''; 
    const email = this.loginForm.value.email;
    const contrasena = this.loginForm.value.contrasena;

    this.authService.login(email, contrasena).subscribe({
      next: (user) => {
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al iniciar sesión. Verifica tus credenciales.';
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get contrasena() { return this.loginForm.get('contrasena'); }
}