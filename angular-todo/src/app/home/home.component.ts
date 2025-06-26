import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MusicService } from '../services/music.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit, AfterViewInit {
  isPlaying = false;
  volume = 0.4;

  backgroundImages = [
    'assets/express.jpg',
    'assets/space_station.png',
    'assets/belobog.webp',
    'assets/loufu.png',
    'assets/penacony.png',
    'assets/amphoreus.jpg',
  ];
  currentBackgroundIndex = 0;

  constructor(private router: Router, public musicService: MusicService, private location: Location) {}


  ngOnInit(): void {
    this.isPlaying = this.musicService.isPlaying;
    this.volume = this.musicService.volume;
    this.musicService.setVolume(this.volume);
  }

  ngAfterViewInit(): void {
    const container = document.querySelector('.page-container.home-background') as HTMLElement;
    if (container) {
      container.style.backgroundImage = `url('${this.backgroundImages[this.currentBackgroundIndex]}')`;
      container.style.transition = 'background-image 1s ease-in-out';

      setInterval(() => {
        this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % this.backgroundImages.length;
        container.style.backgroundImage = `url('${this.backgroundImages[this.currentBackgroundIndex]}')`;
        console.log('Cambiando fondo a:', this.backgroundImages[this.currentBackgroundIndex]);
      }, 20000);
    } else {
      console.error('No se encontró .page-container.home-background');
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

  nextTrack(): void {
    this.musicService.nextTrack();
  }

  goBack() {
    this.location.back();
  }
  goForward() {
    this.location.forward();
  }


}
