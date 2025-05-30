import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
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

  // Obtener todas las tareas con sus categorías
  getTasks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tasks`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Agregar una nueva tarea con su categoría
  addTask(taskData: FormData): Observable<TodoItem> {
    return this.http.post<TodoItem>(`${this.baseUrl}/tasks`, taskData, {
      headers: this.getAuthHeaders() // ✅ usar directamente el objeto HttpHeaders
    }).pipe(
      catchError((error) => {
        console.error('Error al crear la tarea:', error);
        return throwError(() => error);
      })
    );
  }



  // Obtener todas las categorías del usuario
  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Crear una nueva categoría
  addCategory(categoryName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories`, { name: categoryName }, {
      headers: this.getAuthHeaders(),
    });
  }

  // Iniciar sesión del usuario
  loginUser(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/login`, credentials);
  }

  // Registrar un nuevo usuario
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


// PUT /tasks/:id
  updateTask(task: { id: number; title: string; description: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/tasks/${task.id}`, {
      title: task.title,
      description: task.description
    }, {
      headers: this.getAuthHeaders()
    });
  }

}
