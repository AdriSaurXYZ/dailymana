import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private API_URL = 'https://backend-production-a22a.up.railway.app/api';

  constructor(private http: HttpClient) {}

  // POST para registrar que el usuario llegó a 500 puntos hoy
  log500PointsDay(userId: number) {
    return this.http.post(`${this.API_URL}/stats/500-points-log`, { userId });
  }

  // GET para obtener los días que el usuario logró 500 puntos
  get500PointsDays(userId: number) {
    return this.http.get<{fecha: string}[]>(`${this.API_URL}/stats/500-points-log/${userId}`);
  }

  get500PointsCount(userId: number) {
    return this.http.get<{ total: number }>(`${this.API_URL}/stats/500-points-count/${userId}`);
  }

}
