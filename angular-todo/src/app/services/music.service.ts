import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private audio: HTMLAudioElement | null = null;
  public isPlaying = false;
  public volume = 1;

  private tracks: string[] = [
    'assets/space-station.mp3',
    'assets/hope.mp3',
  ];
  private currentTrackIndex = 0;

  constructor() {
    if (typeof Audio !== 'undefined') {
      this.audio = new Audio(this.tracks[this.currentTrackIndex]);
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
    this.isPlaying ? this.pause() : this.play();
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.audio) {
      this.audio.volume = vol;
    }
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    const wasPlaying = this.isPlaying;

    if (this.audio) {
      this.audio.pause();
    }

    this.audio = new Audio(this.tracks[this.currentTrackIndex]);
    this.audio.loop = true;
    this.audio.volume = this.volume;

    if (wasPlaying) {
      this.play();
    }
  }
}
