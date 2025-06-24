import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private API_URL = 'https://backend-production-a22a.up.railway.app/api';

  constructor(private http: HttpClient) {}

  log500PointsDay(userId: number, puntos: number = 500) {
    return this.http.post(`${this.API_URL}/stats/record-500`, { userId, puntos });
  }

  get500PointsDays(userId: number) {
    return this.http.get(`${this.API_URL}/stats/500-points-days/${userId}`);
  }
}
