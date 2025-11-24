export interface User {
  id: number;
  nombre: string;
  email: string;
  direccion: string;
  administrador: number;
  pregunta1?: number;
  pregunta2?: number;
}