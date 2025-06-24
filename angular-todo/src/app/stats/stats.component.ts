import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../services/stat.service';

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

  constructor(private statsService: StatsService) {}

  ngOnInit() {
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      console.error('No se pudo obtener el ID del usuario.');
      return;
    }

    const userId = Number(userIdStr);
    if (isNaN(userId) || userId <= 0) {
      console.error('El ID del usuario no es válido:', userIdStr);
      return;
    }

    // Obtener lista de días
    this.statsService.get500PointsDays(userId).subscribe({
      next: (data) => {
        this.days = data;
      },
      error: (err) => {
        console.error('Error al cargar los días con 500+ puntos:', err);
      }
    });

    // Obtener el contador total
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
