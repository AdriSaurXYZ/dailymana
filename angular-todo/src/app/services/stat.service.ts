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

  log500PointsDay(usuarioId: number) {
    return this.http.post(`${this.API_URL}/stats/500-points-log`, {
      usuario_id: usuarioId
    });
  }


  get500PointsDays(userId: number): Observable<{ fecha: string }[]> {
    return this.http.get<{ fecha: string }[]>(`${this.API_URL}/user/${userId}/stats/500-points-days`, {
      headers: this.getAuthHeaders()
    });
  }

  get500PointsCount(userId: number): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.API_URL}/user/${userId}/stats/500-points-count`, {
      headers: this.getAuthHeaders()
    });
  }
}
