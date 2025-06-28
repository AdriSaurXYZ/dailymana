import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import { StatsService } from '../services/stat.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-stats-wuwa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wuwa_stats.component.html',
  styleUrls: ['./wuwa_stats.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class Wuwa_statsComponent implements OnInit {
  days: { fecha: string }[] = [];
  totalCount: number = 0;

  constructor(
    private statsService: StatsService,
    private apiService: ApiService,
  private location: Location

  ) {}

  ngOnInit() {
    const userId = this.apiService.getUserIdFromToken();

    if (!userId || isNaN(userId) || userId <= 0) {
      console.error('El ID del usuario no es válido:', userId);
      return;
    }

    // Solo para WuWa
    this.statsService.get500PointsDays(userId, 'wuwa').subscribe({
      next: (data) => {
        this.days = data;
      },
      error: (err) => {
        console.error('Error al cargar los días con 500+ puntos en WuWa:', err);
      }
    });

    this.statsService.get500PointsCount(userId, 'wuwa').subscribe({
      next: (data: any) => {
        this.totalCount = data.count;
      },
      error: (err) => {
        console.error('Error al obtener el contador total de WuWa:', err);
      }
    });
  }


  goBack() {
    this.location.back();
  }
  goForward() {
    this.location.forward();
  }
}
