import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private API_URL = 'https://backend-production-a22a.up.railway.app/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('userToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // POST para registrar que el usuario llegó a 500 puntos hoy
  log500PointsDay(userId: number) {
    return this.http.post(`${this.API_URL}/stats/500-points-log`, { userId }, {
      headers: this.getAuthHeaders()
    });
  }

  // GET para obtener los días que el usuario logró 500 puntos
  get500PointsDays(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/user/${userId}/stats/500-points-days`, {
      headers: this.getAuthHeaders()
    });
  }

  // GET para obtener el contador total
  get500PointsCount(userId: number): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.API_URL}/user/${userId}/stats/500-points-count`, {
      headers: this.getAuthHeaders()
    });
  }
}
