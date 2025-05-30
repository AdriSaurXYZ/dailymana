import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MusicService } from '../services/music.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  standalone: true,
  selector: 'app-home-menu',
  templateUrl: './home-menu.component.html',
  imports: [
    CommonModule,
    FormsModule
  ],
  styleUrls: ['./home-menu.component.css']
})
export class HomeMenuComponent implements OnInit {
  volume: number = 0.5;
  isPlaying: boolean = true;

  constructor(
    private router: Router,
    public musicService: MusicService,
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  // Audio
  hoverSound = new Audio('assets/hover.mp3');
  clickSound = new Audio('assets/click.mp3');

  // Usuario
  user = {
    name: '',
    email: '',
    photoUrl: 'assets/default-profile.png'
  };

  showDropdown: boolean = false;

  // Selección de imagen de personaje
  characters: any[] = [];
  showPhotoSelector = false;
  defaultPhoto = 'assets/default-profile.png';

  cargarPerfil() {
    this.http.get<any>(`https://backend-production-a22a.up.railway.app/api/users/profile?email=${this.user.email}`)
      .subscribe({
        next: (data) => {
          this.user.name = data.name;
          this.user.photoUrl = data.profile_image_url || this.defaultPhoto;
          localStorage.setItem('userPhotoUrl', this.user.photoUrl);
        },
        error: (err) => {
          console.error('❌ Error al obtener perfil:', err);
        }
      });
  }

  ngOnInit(): void {
    this.isPlaying = this.musicService.isPlaying;
    this.volume = this.musicService.volume;
    this.musicService.setVolume(this.volume);

    const storedEmail = localStorage.getItem('userEmail');
    const storedPhoto = localStorage.getItem('userPhotoUrl');

    if (storedPhoto) {
      this.user.photoUrl = storedPhoto;
    }

    if (storedEmail) {
      this.user.email = storedEmail;
      this.cargarPerfil();
    }

    // 🔔 Verificar notificaciones al entrar al Home
    this.notificationService.checkAndShowNotifications();
  }

  navigateTo(route: string) {
    if (route === 'logout') {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/' + route]);
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }

  toggleProfileDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  toggleMusic(): void {
    this.musicService.toggle();
    this.isPlaying = this.musicService.isPlaying;
  }

  adjustVolume(): void {
    this.musicService.setVolume(this.volume);
  }

  playHover() {
    const hover = new Audio('assets/hover.mp3');
    hover.play();
  }

  playClick() {
    const click = new Audio('assets/click.mp3');
    click.play();
  }

  togglePhotoSelector() {
    this.showPhotoSelector = !this.showPhotoSelector;

    if (this.showPhotoSelector && this.characters.length === 0) {
      this.http.get('https://backend-production-a22a.up.railway.app/api/characters')
        .subscribe({
          next: (data: any) => {
            this.characters = data;
          },
          error: () => alert('Error al cargar personajes')
        });
    }
  }

  setAsProfileImage(characterId: number) {
    if (!this.user.email) {
      alert('Usuario no autenticado');
      return;
    }

    this.http.patch('https://backend-production-a22a.up.railway.app/api/users/profile-photo', {
      email: this.user.email,
      characterId: characterId
    }).subscribe({
      next: () => {
        this.cargarPerfil(); // ✅ Refresca la imagen desde el backend
        this.showPhotoSelector = false;
      },
      error: (err) => {
        console.error('❌ Error al actualizar foto:', err);
        alert('Error al actualizar la foto de perfil');
      }
    });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.user-profile');
    if (!clickedInside) {
      this.showDropdown = false;
      this.showPhotoSelector = false;
    }
  }

  onCharacterListWheel(event: WheelEvent) {
    const container = document.querySelector('.lista-personajes');
    if (container) {
      // Ya no necesitas hacer scroll manual, pero puedes controlar la velocidad si quieres
      event.preventDefault();
      container.scrollTop += event.deltaY;
    }
  }

}
