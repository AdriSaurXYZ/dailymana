import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { FormsModule, NgForm } from '@angular/forms';
import { MusicService } from '../services/music.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  imports: [FormsModule],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  isPlaying = false;
  volume = 0.4;

  constructor(
    private apiService: ApiService,
    private router: Router,
    public musicService: MusicService
  ) {}

  ngOnInit(): void {
    this.isPlaying = this.musicService.isPlaying;
    this.volume = this.musicService.volume;
    this.musicService.setVolume(this.volume);
  }

  register(form: NgForm): void {
    if (!form.valid) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(this.email)) {
      alert('Por favor, ingresa un correo válido que termine en @gmail.com');
      return;
    }

    const userData = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.apiService.registerUser(userData).subscribe({
      next: () => {
        alert('Registro exitoso');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if (err.status === 409) {
          alert('El correo ya está registrado');
        } else {
          alert('Error al registrar usuario.');
        }
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

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
