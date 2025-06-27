import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private API_URL = 'https://backend-production-a22a.up.railway.app/api';

  constructor(private http: HttpClient) {
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('userToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  log500PointsDay(usuarioId: number, juego: 'hsr' | 'wuwa') {
    return this.http.post(`${this.API_URL}/stats/500-points-log`, {
      usuario_id: usuarioId,
      juego: juego
    });
  }


  get500PointsDays(userId: number, juego: 'hsr' | 'wuwa'): Observable<{ fecha: string }[]> {
    return this.http.get<{ fecha: string }[]>(
      `${this.API_URL}/user/${userId}/stats/500-points-days?juego=${juego}`,
      {headers: this.getAuthHeaders()}
    );
  }

  get500PointsCount(userId: number, juego: 'hsr' | 'wuwa'): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.API_URL}/user/${userId}/stats/500-points-count?juego=${juego}`,
      {headers: this.getAuthHeaders()}
    );
  }
}
