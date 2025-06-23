import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private apiService: ApiService) {}

  checkAndShowNotifications(): void {
    this.checkDailyNotifications();
    this.checkOverdueTasks(); // ✅ Verificación de tareas vencidas
  }

  private checkDailyNotifications(): void {
    const now = new Date();
    const todayStr = now.toDateString();

    const email = localStorage.getItem('userEmail');

    if (!email) {
      console.warn('[DEBUG] No se encontró userEmail en localStorage');
      return;
    }

    const resetKey = `lastResetNotification-${email}`;
    const mondayKey = `lastMondayNotification-${email}`;

    const lastReset = localStorage.getItem(resetKey);

    if (lastReset !== todayStr) {
      this.showResetNotification();
      localStorage.setItem(resetKey, todayStr);
    }

    // 🔄 Notificación del lunes después de las 4:00 a. m.
    const lastMondayTimestamp = Number(localStorage.getItem(mondayKey)) || 0;
    const currentWeekMondayAt4 = this.getThisWeekMondayAt4AM();

    if (now >= currentWeekMondayAt4 && lastMondayTimestamp < currentWeekMondayAt4.getTime()) {
      this.showMondayNotification();
      localStorage.setItem(mondayKey, now.getTime().toString());
    } else {
      console.log('[DEBUG] No se cumplen condiciones para notificación del lunes');
    }
  }

  private getThisWeekMondayAt4AM(): Date {
    const now = new Date();
    const day = now.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    const diff = (day + 6) % 7; // transforma lunes en 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(4, 0, 0, 0);
    return monday;
  }

  private checkOverdueTasks(): void {
    console.log('[DEBUG] checkOverdueTasks iniciado');

    this.apiService.getTasks().subscribe({
      next: (tasks: any[]) => {
        const now = new Date();
        const overdue = tasks.filter(task => {
          const due = task.due_date ? new Date(task.due_date) : null;
          return due && due < now && task.status !== 'completed';
        });

        console.log('[DEBUG] Tareas vencidas encontradas:', overdue.length);

        if (overdue.length > 0) {
          this.showOverdueNotification(overdue);
        }
      },
      error: (err) => console.error('[DEBUG] Error verificando tareas vencidas:', err)
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
      console.log('[DEBUG] Mostrando notificación de tareas diarias');
      new Notification('✅ Tareas reiniciadas', {
        body: 'Ya puedes volver a hacer tus tareas diarias.',
        icon: 'assets/daily.webp'
      });
    });
  }

  private showMondayNotification(): void {
    this.ensureNotificationPermission(() => {
      console.log('[DEBUG] Mostrando notificación de lunes');
      new Notification('🌀 Universos y Jefes reiniciados', {
        body: 'Ya puedes completar el Universo Simulado y los jefes semanales.',
        icon: 'assets/sim.webp'
      });
    });
  }

  private ensureNotificationPermission(callback: () => void): void {
    console.log('[DEBUG] Estado de permisos de notificación:', Notification.permission);

    if (Notification.permission === 'granted') {
      callback();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        console.log('[DEBUG] Permiso de notificación solicitado. Resultado:', permission);
        if (permission === 'granted') {
          callback();
        }
      });
    } else {
      console.warn('[DEBUG] Permiso de notificación denegado');
    }
  }
}
