import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MusicService } from '../services/music.service';
import {Location} from '@angular/common';  // importa el servicio

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  isPlaying = false;
  volume = 0.4;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar,
    public musicService: MusicService,  // inyecta el servicio
  private location: Location
  ) {}

  ngOnInit(): void {
    this.isPlaying = this.musicService.isPlaying;
    this.volume = this.musicService.volume;
    this.musicService.setVolume(this.volume);
  }

  login(): void {
    this.apiService.loginUser({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Respuesta login:', response); // <--- Añade esto para depurar
        localStorage.setItem('userToken', response.token);

        // Guarda userId como string explícitamente
        if (response.userId !== undefined && response.userId !== null) {
          localStorage.setItem('userId', response.userId.toString());
        } else {
          console.warn('Respuesta de login sin userId:', response);
        }

        localStorage.setItem('userEmail', this.email);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.showError('No se pudo iniciar sesión. Verifica tus credenciales.');
      }
    });
  }



  toggleMusic(): void {
    this.musicService.toggle();
    this.isPlaying = this.musicService.isPlaying;
  }

  adjustVolume(): void {
    this.musicService.setVolume(this.volume);
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goBack() {
    this.location.back();
  }
  goForward() {
    this.location.forward();
  }
}
