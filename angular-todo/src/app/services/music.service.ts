import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private audio: HTMLAudioElement | null = null;
  public isPlaying = false;
  public volume = 1;

  constructor() {
    if (typeof Audio !== 'undefined') {
      this.audio = new Audio('assets/space-station.mp3');
      this.audio.loop = true;
      this.audio.volume = this.volume;
    }
  }

  play() {
    if (this.audio) {
      this.audio.play();
      this.isPlaying = true;
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.audio) {
      this.audio.volume = vol;
    }
  }
}
