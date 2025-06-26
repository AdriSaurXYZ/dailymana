import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MusicService } from '../services/music.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {CommonModule, Location} from '@angular/common';
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

  // Usuario
  user = {
    name: '',
    email: '',
    photoUrl: 'assets/default-profile.png'
  };

  showDropdown: boolean = false;
  showEditProfile: boolean = false; // Nuevo flag para mostrar el formulario

  // Datos para editar el perfil
  editData = {
    name: '',
    email: '',
    password: ''
  };

  // Selección de imagen de personaje
  characters: any[] = [];
  showPhotoSelector = false;
  defaultPhoto = 'assets/default-profile.png';

  constructor(
    public router: Router,
    public musicService: MusicService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private location: Location
  ) {}

  // Audio
  hoverSound = new Audio('assets/hover.mp3');
  clickSound = new Audio('assets/click.mp3');

  cargarPerfil() {
    this.http.get<any>(`https://backend-production-a22a.up.railway.app/api/users/profile?email=${this.user.email}`)
      .subscribe({
        next: (data) => {
          this.user.name = data.name;
          this.user.photoUrl = data.profile_image_url || this.defaultPhoto;
          localStorage.setItem('userPhotoUrl', this.user.photoUrl);
          // También inicializa los datos de edición
          this.editData.name = data.name;
          this.editData.email = data.email;
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

    this.notificationService.checkAndShowNotifications();
    console.log('📦 Token al iniciar HomeMenu:', localStorage.getItem('userToken'));
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

  toggleEditProfile(): void {
    this.showEditProfile = !this.showEditProfile;
    // Opcional: al abrir el formulario, asegura cargar los datos actuales
    if (this.showEditProfile) {
      this.editData.name = this.user.name;
      this.editData.email = this.user.email;
      this.editData.password = '';
    }
  }

  updateProfile(): void {
    const payload: any = {
      name: this.editData.name,
      email: this.editData.email
    };

    if ((this.editData.password || '').trim().length > 0) {
      payload.password = this.editData.password;
    }

    // ✅ Recupera el token del localStorage
    const token = localStorage.getItem('userToken');


    // ✅ Construye los headers con Authorization
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('🔐 Token usado:', token);

    this.http.patch('https://backend-production-a22a.up.railway.app/api/users/profile-update', payload, { headers })
      .subscribe({
        next: (response: any) => {
          this.user.name = response.name;
          this.user.email = response.email;
          localStorage.setItem('userEmail', response.email);
          alert('Perfil actualizado correctamente.');
          this.toggleEditProfile();
        },
        error: (err) => {
          console.error('❌ Error al actualizar perfil:', err);
          alert('Error al actualizar perfil.');
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

  // Activado por defecto, pero checkbox sin marcar
  muteHoverSound: boolean = false;
  muteClickSound: boolean = false;

  playHover() {
    if (!this.muteHoverSound) {
      const hover = new Audio('assets/hover.mp3');
      hover.play();
    }
  }

  playClick() {
    if (!this.muteClickSound) {
      const click = new Audio('assets/click.mp3');
      click.play();
    }
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
        this.cargarPerfil();
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
      this.showEditProfile = false;
    }
  }

  onCharacterListWheel(event: WheelEvent) {
    const container = document.querySelector('.lista-personajes');
    if (container) {
      event.preventDefault();
      container.scrollTop += event.deltaY;
    }
  }

  goBack() {
    this.location.back();
  }
  goForward() {
    this.location.forward();
  }


}
