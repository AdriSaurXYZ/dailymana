import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../services/stat.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  days: { fecha: string }[] = [];
  totalCount: number = 0;

  constructor(
    private statsService: StatsService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    const userId = this.apiService.getUserIdFromToken(); // O usa localStorage
    if (!userId || isNaN(userId) || userId <= 0) {
      console.error('El ID del usuario no es válido:', userId);
      return;
    }

    this.statsService.get500PointsDays(userId).subscribe({
      next: (data) => {
        this.days = data;
      },
      error: (err) => {
        console.error('Error al cargar los días con 500+ puntos:', err);
      }
    });

    this.statsService.get500PointsCount(userId).subscribe({
      next: (data) => {
        this.totalCount = data.total;
      },
      error: (err) => {
        console.error('Error al obtener el contador total:', err);
      }
    });
  }
}
