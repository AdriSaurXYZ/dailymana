import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { TodoItem } from '../tasks/tasks.component';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'https://backend-production-a22a.up.railway.app/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('userToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getTasks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tasks`, {
      headers: this.getAuthHeaders(),
    });
  }

  addTask(taskData: FormData): Observable<TodoItem> {
    return this.http.post<TodoItem>(`${this.baseUrl}/tasks`, taskData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error al crear la tarea:', error);
        return throwError(() => error);
      })
    );
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories`, {
      headers: this.getAuthHeaders(),
    });
  }

  addCategory(categoryName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories`, { name: categoryName }, {
      headers: this.getAuthHeaders(),
    });
  }

  loginUser(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/login`, credentials);
  }

  registerUser(userData: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/register`, userData);
  }

  updateTaskStatus(id: number, completed: boolean): Observable<any> {
    const status = completed ? 'completed' : 'pending';
    return this.http.put(`${this.baseUrl}/tasks/${id}/status`, { status }, {
      headers: this.getAuthHeaders(),
    });
  }

  updateTaskCategoryAndOrder(id: number, newCategory: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/tasks/${id}/category`, { category: newCategory }, {
      headers: this.getAuthHeaders()
    });
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tasks/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateTask(task: { id: number; title: string; description: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/tasks/${task.id}`, {
      title: task.title,
      description: task.description
    }, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Nuevo método corregido
  get500PointDays(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/${userId}/stats/500-points-days`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserIdFromToken(): number | null {
    const token = localStorage.getItem('userToken');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || null;
    } catch (e) {
      console.error('Token inválido:', e);
      return null;
    }
  }

  // === MÉTODOS WUWA TASKS ===

  getWuwaTasks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/wuwa_tasks`, {
      headers: this.getAuthHeaders(),
    });
  }

  addWuwaTask(taskData: FormData): Observable<TodoItem> {
    return this.http.post<TodoItem>(`${this.baseUrl}/wuwa_tasks`, taskData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error al crear la WUWA tarea:', error);
        return throwError(() => error);
      })
    );
  }

  updateWuwaTaskStatus(id: number, completed: boolean): Observable<any> {
    const status = completed ? 'completed' : 'pending';
    return this.http.put(`${this.baseUrl}/wuwa_tasks/${id}/status`, { status }, {
      headers: this.getAuthHeaders(),
    });
  }

  updateWuwaTaskCategoryAndOrder(id: number, newCategory: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/wuwa_tasks/${id}/category`, { category: newCategory }, {
      headers: this.getAuthHeaders()
    });
  }

  deleteWuwaTask(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/wuwa_tasks/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateWuwaTask(task: { id: number; title: string; description: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/wuwa_tasks/${task.id}`, {
      title: task.title,
      description: task.description
    }, {
      headers: this.getAuthHeaders()
    });
  }


}
