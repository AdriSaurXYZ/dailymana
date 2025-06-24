import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-stats',
  standalone: true, // ✅ Hace que el componente sea independiente
  imports: [CommonModule], // ✅ Necesario para usar *ngFor, *ngIf, etc.
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  days: { fecha: string, total_puntos: number }[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    const userId = this.api.getUserIdFromToken();
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario desde el token.');
      return;
    }

    this.api.get500PointDays(userId).subscribe({
      next: (data) => {
        this.days = data;
      },
      error: (err) => {
        console.error('Error al cargar los días con 500+ puntos:', err);
      }
    });
  }
}
