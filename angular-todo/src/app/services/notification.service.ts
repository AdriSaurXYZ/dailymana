import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private apiService: ApiService) {}

  checkAndShowNotifications(game: 'hsr' | 'wuwa'): void {
    this.checkDailyNotifications(game);
    this.checkOverdueTasks(game);
  }

  private checkDailyNotifications(game: 'hsr' | 'wuwa'): void {
    const now = new Date();
    const todayStr = now.toDateString();

    const email = localStorage.getItem('userEmail');
    if (!email) return;

    const resetKey = `lastResetNotification-${game}-${email}`;
    const mondayKey = `lastMondayNotification-${game}-${email}`;
    const lastReset = localStorage.getItem(resetKey);

    if (lastReset !== todayStr) {
      this.showResetNotification(game);
      localStorage.setItem(resetKey, todayStr);
    }

    const lastMondayTimestamp = Number(localStorage.getItem(mondayKey)) || 0;
    const currentWeekMondayAt4 = this.getThisWeekMondayAt4AM();

    if (now >= currentWeekMondayAt4 && lastMondayTimestamp < currentWeekMondayAt4.getTime()) {
      this.showMondayNotification(game);
      localStorage.setItem(mondayKey, now.getTime().toString());
    }
  }

  private checkOverdueTasks(game: 'hsr' | 'wuwa'): void {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    const now = Date.now();
    const overdueKey = `lastOverdueNotification-${game}-${email}`;
    const lastNotified = Number(localStorage.getItem(overdueKey)) || 0;
    const notifyCooldown = 5 * 60 * 1000; // 5 minutos

    const tasksObservable = game === 'hsr'
      ? this.apiService.getTasks()
      : this.apiService.getWuwaTasks();

    tasksObservable.subscribe({
      next: (tasks: any[]) => {
        // En WuWa no tienes 'task.game' así que no hace falta filtrar por ese campo
        const overdue = tasks.filter(task =>
          new Date(task.due_date) < new Date() &&
          task.status !== 'completed'
        );

        if (overdue.length > 0 && (now - lastNotified > notifyCooldown)) {
          this.showOverdueNotification(overdue, game);
          localStorage.setItem(overdueKey, now.toString());
        }
      },
      error: (err) => console.error('Error verificando tareas vencidas:', err)
    });
  }


  private showResetNotification(game: 'hsr' | 'wuwa'): void {
    this.ensureNotificationPermission(() => {
      const message = game === 'hsr'
        ? {
          title: '✅ Tareas diarias reiniciadas',
          body: 'Ya puedes hacer tus misiones en Honkai Star Rail.',
          icon: 'assets/daily.webp'
        }
        : {
          title: '✅ Tareas reiniciadas en WuWa',
          body: 'Tus tareas diarias están listas en Wuthering Waves.',
          icon: 'assets/wuwa-daily.webp'
        };

      new Notification(message.title, {
        body: message.body,
        icon: message.icon
      });
    });
  }

  private showMondayNotification(game: 'hsr' | 'wuwa'): void {
    this.ensureNotificationPermission(() => {
      const message = game === 'hsr'
        ? {
          title: '🌀 Universos y jefes reiniciados',
          body: 'Ya puedes completar el Universo Simulado y desfiar a los jefes semanales.',
          icon: 'assets/sim.webp'
        }
        : {
          title: '🎭 Fantasía de las Mil Puertas reiniciada',
          body: 'Ya puedes completar la Fantasia de las Mil Puertas y desafiar a los jefes semanales.',
          icon: 'assets/fantasia.png'
        };

      new Notification(message.title, {
        body: message.body,
        icon: message.icon
      });
    });
  }

  private showOverdueNotification(overdueTasks: any[], game: 'hsr' | 'wuwa'): void {
    this.ensureNotificationPermission(() => {
      const title = game === 'hsr'
        ? '📌 Tareas vencidas - HSR'
        : '📌 Tareas vencidas - WuWa';

      const body = overdueTasks.length === 1
        ? `La tarea "${overdueTasks[0].title}" ha vencido.`
        : `Tienes ${overdueTasks.length} tareas vencidas en ${game.toUpperCase()}.`;

      const icon = game === 'hsr' ? 'assets/alerta.png' : 'assets/wuwa-alerta.png';

      const notification = new Notification(title, {
        body,
        icon
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = `${window.location.origin}/tasks-${game}`;
      };
    });
  }

  private ensureNotificationPermission(callback: () => void): void {
    if (!('Notification' in window)) return;

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

  private getThisWeekMondayAt4AM(): Date {
    const now = new Date();
    const day = now.getDay(); // domingo = 0, lunes = 1, ..., sábado = 6
    const diff = (day === 0 ? -6 : 1 - day); // ajustar para obtener lunes

    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(4, 0, 0, 0);

    return monday;
  }
}
