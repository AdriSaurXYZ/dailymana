import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { FormsModule, NgForm } from '@angular/forms';
import { MusicService } from '../services/music.service';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, NgStyle]
})
export class RegisterComponent implements OnInit {
  name = '';
  email = '';
  password = '';
  isPlaying = false;
  volume = 0.4;

  passwordStrengthMessage = '';
  passwordStrengthColor = 'red';
  passwordStrength = 0;
  isPasswordStrong = false;

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
    this.checkPasswordStrength();

    if (!form.valid || !this.isPasswordStrong) {
      alert('Por favor, completa todos los campos correctamente y usa una contraseña segura.');
      return;
    }

    const userData = {
      name: this.name.trim(),
      email: this.email.trim(),
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


  checkPasswordStrength(): void {
    const pwd = this.password;

    const lengthRequirement = /.{8,}/;
    const upperRequirement = /[A-Z]/;
    const lowerRequirement = /[a-z]/;
    const numberRequirement = /\d/;
    const specialRequirement = /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`';]/;

    const checks = [
      lengthRequirement.test(pwd),
      upperRequirement.test(pwd),
      lowerRequirement.test(pwd),
      numberRequirement.test(pwd),
      specialRequirement.test(pwd)
    ];

    const passed = checks.filter(Boolean).length;

    this.passwordStrength = (passed / 5) * 100;
    this.isPasswordStrong = passed === 5;

    if (passed <= 2) {
      this.passwordStrengthMessage = 'Débil';
      this.passwordStrengthColor = 'red';
    } else if (passed <= 4) {
      this.passwordStrengthMessage = 'Media';
      this.passwordStrengthColor = 'orange';
    } else {
      this.passwordStrengthMessage = 'Fuerte';
      this.passwordStrengthColor = 'limegreen';
    }
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
