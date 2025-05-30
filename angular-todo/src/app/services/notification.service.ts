import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private apiService: ApiService) {}

  checkAndShowNotifications(): void {
    this.checkDailyNotifications();
    this.checkOverdueTasks(); // ✅ Nueva verificación de tareas vencidas
  }

  private checkDailyNotifications(): void {
    const now = new Date();
    const todayStr = now.toDateString();

    const email = localStorage.getItem('userEmail');
    if (!email) return;

    const resetKey = `lastResetNotification-${email}`;
    const mondayKey = `lastMondayNotification-${email}`;

    const lastReset = localStorage.getItem(resetKey);
    const lastMonday = localStorage.getItem(mondayKey);

    if (lastReset !== todayStr) {
      this.showResetNotification();
      localStorage.setItem(resetKey, todayStr);
    }

    const isMonday = now.getDay() === 1;
    if (isMonday && lastMonday !== todayStr) {
      this.showMondayNotification();
      localStorage.setItem(mondayKey, todayStr);
    }
  }

  private checkOverdueTasks(): void {
    this.apiService.getTasks().subscribe({
      next: (tasks: any[]) => {
        const now = new Date();
        const overdue = tasks.filter(task => {
          const due = task.due_date ? new Date(task.due_date) : null;
          return due && due < now && task.status !== 'completed';
        });

        if (overdue.length > 0) {
          this.showOverdueNotification(overdue); // 👈 pasa el array entero
        }
      },
      error: (err) => console.error('Error verificando tareas vencidas:', err)
    });
  }


  private showOverdueNotification(overdueTasks: any[]): void {
    this.ensureNotificationPermission(() => {
      let title = '📌 Tareas vencidas';
      let body = '';

      if (overdueTasks.length === 1) {
        const task = overdueTasks[0];
        body = `La tarea "${task.title}" ha pasado su fecha límite.`;
      } else {
        body = `Tienes ${overdueTasks.length} tareas que han pasado su fecha límite.`;
      }

      const notification = new Notification(title, {
        body,
        icon: 'assets/alerta.png'
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = `${window.location.origin}/tasks`;
      };
    });
  }


  private showResetNotification(): void {
    this.ensureNotificationPermission(() => {
      new Notification('✅ Tareas reiniciadas', {
        body: 'Ya puedes volver a hacer tus tareas diarias.',
        icon: 'assets/daily.webp'
      });
    });
  }

  private showMondayNotification(): void {
    this.ensureNotificationPermission(() => {
      new Notification('🌀 Universos y Jefes reiniciados', {
        body: 'Ya puedes completar el Universo Simulado y los jefes semanales.',
        icon: 'assets/sim.webp'
      });
    });
  }

  private ensureNotificationPermission(callback: () => void): void {
    if (Notification.permission === 'granted') {
      callback();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          callback();
        }
      });
    }
  }
}
