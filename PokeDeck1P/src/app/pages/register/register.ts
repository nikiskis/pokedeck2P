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
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      direccion: ['', [Validators.required]],
      pregunta1: ['', [Validators.required]],
      respuesta1: ['', [Validators.required]],
      pregunta2: ['', [Validators.required]],
      respuesta2: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    
    const { pregunta1, pregunta2 } = this.registerForm.value;
    if (pregunta1 == pregunta2) {
        this.error = "Debes seleccionar dos preguntas de seguridad diferentes.";
        return;
    }

    this.error = '';
    const { nombre, email, contrasena, direccion, respuesta1, respuesta2 } = this.registerForm.value;

    this.authService.register(
        nombre, 
        email, 
        contrasena, 
        direccion, 
        parseInt(pregunta1), 
        respuesta1, 
        parseInt(pregunta2), 
        respuesta2
    ).subscribe({
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
  get f_pregunta1() { return this.registerForm.get('pregunta1'); }
  get f_respuesta1() { return this.registerForm.get('respuesta1'); }
  get f_pregunta2() { return this.registerForm.get('pregunta2'); }
  get f_respuesta2() { return this.registerForm.get('respuesta2'); }
}