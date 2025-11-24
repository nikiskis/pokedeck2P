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
  
  viewState: 'login' | 'email-input' | 'questions-input' = 'login';
  
  loginForm: FormGroup;
  recoveryForm: FormGroup;
  
  error: string = '';
  successMessage: string = '';
  
  recoveryEmail: string = '';
  userQuestions: any = null;
  preguntasSeguridad = [
    { id: 1, texto: '¿Cuál fue el primer Pokémon que elegiste en algún juego de Pokémon?' },
    { id: 2, texto: '¿Qué región del mundo Pokémon es tu favorita (Kanto, Johto, Hoenn, etc.)?' },
    { id: 3, texto: '¿Quién es tu entrenador o personaje favorito del anime Pokémon?' },
    { id: 4, texto: '¿Qué Pokémon te acompañaría si vivieras en el mundo Pokémon?' },
    { id: 5, texto: '¿Cuál fue el primer juego de Pokémon que jugaste?' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.recoveryForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        respuesta1: [''],
        respuesta2: [''],
        nuevaContrasena: ['']
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); 
      return;
    }

    this.error = ''; 
    const { email, contrasena } = this.loginForm.value;

    this.authService.login(email, contrasena).subscribe({
      next: (user) => {
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.error = 'Error al iniciar sesión. Verifica tus credenciales.';
      }
    });
  }


  toggleRecovery(): void {
      this.viewState = 'email-input';
      this.error = '';
      this.successMessage = '';
  }

  cancelRecovery(): void {
      this.viewState = 'login';
      this.error = '';
      this.successMessage = '';
      this.recoveryForm.reset();
  }

  checkEmail(): void {
      const email = this.recoveryForm.get('email')?.value;
      if (!email) {
          this.error = 'Ingresa tu email.';
          return;
      }

      this.authService.getSecurityQuestions(email).subscribe({
          next: (data) => {
              this.userQuestions = data;
              this.recoveryEmail = email;
              this.viewState = 'questions-input';
              this.error = '';
              
              this.recoveryForm.get('respuesta1')?.setValidators(Validators.required);
              this.recoveryForm.get('respuesta2')?.setValidators(Validators.required);
              this.recoveryForm.get('nuevaContrasena')?.setValidators([Validators.required, Validators.minLength(6)]);
          },
          error: (err) => {
              this.error = err.message || 'Email no encontrado.';
          }
      });
  }

  getQuestionText(id: number): string {
      const q = this.preguntasSeguridad.find(p => p.id === id);
      return q ? q.texto : 'Pregunta desconocida';
  }

  resetPassword(): void {
      if (this.recoveryForm.invalid) {
          this.recoveryForm.markAllAsTouched();
          return;
      }

      const { respuesta1, respuesta2, nuevaContrasena } = this.recoveryForm.value;

      this.authService.resetPassword(this.recoveryEmail, respuesta1, respuesta2, nuevaContrasena).subscribe({
          next: (res) => {
              this.successMessage = 'Contraseña restablecida correctamente. Inicia sesión.';
              this.viewState = 'login';
              this.loginForm.reset();
          },
          error: (err) => {
              this.error = err.message || 'Respuestas incorrectas.';
          }
      });
  }

  get email() { return this.loginForm.get('email'); }
  get contrasena() { return this.loginForm.get('contrasena'); }
  
  get rec_email() { return this.recoveryForm.get('email'); }
  get rec_res1() { return this.recoveryForm.get('respuesta1'); }
  get rec_res2() { return this.recoveryForm.get('respuesta2'); }
  get rec_pass() { return this.recoveryForm.get('nuevaContrasena'); }
}