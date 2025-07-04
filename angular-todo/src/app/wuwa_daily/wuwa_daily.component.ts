import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../services/notification.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms'; // Ajusta la ruta si es diferente
import { MusicService } from '../services/music.service'; // Importa el servicio de música
import { StatsService } from '../services/stat.service';

interface Task {
  name: string;
  progress: number;
  goal: number;
  completed: boolean;
  points: number;
}

@Component({
  selector: 'app-diarias-wuwa',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, ReactiveFormsModule, FormsModule],
  templateUrl: './wuwa_daily.component.html',
  styleUrls: ['./wuwa_daily.component.css'],
})
export class Wuwa_diariasComponent implements OnInit {
  volume: number = 0.5;
  isPlaying: boolean = true;
  tasks: Task[] = [];
  timer: string = '';
  progress: number = 0;
  rewardMilestones: number[] = [100, 200, 300, 400, 500];
  claimedMilestones: number[] = [];
  maxPoints: number = 500;

  constructor(
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,// ✅ Inyectado
    public musicService: MusicService,
  private statsService: StatsService,
    private location: Location
  ) {}

  hoverSound = new Audio('assets/hover.mp3');
  clickSound = new Audio('assets/click.mp3');

  ngOnInit(): void {
    this.isPlaying = this.musicService.isPlaying;
    this.volume = this.musicService.volume;
    this.musicService.setVolume(this.volume);

    this.notificationService.checkAndShowNotifications('wuwa');


    this.loadClaimedMilestones();
    this.loadTaskCompletion();
    this.initializeTasks();
    this.calculateProgress();
    this.updateTimer();

    setInterval(() => this.updateTimer(), 1000);
  }

  getLastResetDate(): string {
    const now = new Date();
    const reset = new Date();
    reset.setHours(4, 0, 0, 0);
    if (now < reset) reset.setDate(reset.getDate() - 1);
    return reset.toISOString().split('T')[0];
  }

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  ngAfterViewInit(): void {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;

      el.addEventListener('wheel', (event: WheelEvent) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          event.preventDefault();
          el.scrollLeft += event.deltaY;
        }
      }, { passive: false });
    }
  }


  initializeTasks(): void {
    this.tasks = [
      { name: 'Recoge 3 nodos de ecos', progress: 0, goal: 3, completed: false, points: 100 },
      { name: 'Derrota a un jefe semanal', progress: 0, goal: 1, completed: false, points: 200 },
      { name: 'Explora una nueva área del mapa', progress: 0, goal: 1, completed: false, points: 100 },
      { name: 'Completa una instancia de Torre Tacet', progress: 0, goal: 1, completed: false, points: 200 },
      { name: 'Refina un eco en la estación de resonancia', progress: 0, goal: 1, completed: false, points: 100 },
      { name: 'Recoge 10 materiales de recolección', progress: 0, goal: 10, completed: false, points: 100 },
      { name: 'Realiza una misión secundaria', progress: 0, goal: 1, completed: false, points: 200 },
      { name: 'Intercambia materiales en el mercado', progress: 0, goal: 1, completed: false, points: 100 },
      { name: 'Mejora una habilidad de un personaje', progress: 0, goal: 1, completed: false, points: 100 },
      { name: 'Completa una instancia cooperativa', progress: 0, goal: 1, completed: false, points: 500 },
    ];

    const completedTaskNames = this.loadTaskCompletion();
    this.tasks.forEach(task => {
      if (completedTaskNames.includes(task.name)) {
        task.completed = true;
      }
    });
  }

  updateTimer(): void {
    const now = new Date();
    const nextReset = new Date();
    nextReset.setHours(4, 0, 0, 0);
    if (now >= nextReset) nextReset.setDate(nextReset.getDate() + 1);

    const diff = nextReset.getTime() - now.getTime();
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    this.timer = `${hours}h ${minutes}m`;
  }

  toggleTask(task: Task): void {
    if (this.progress >= this.maxPoints && !task.completed) {
      this.snackBar.open('Ya has alcanzado los 500 puntos. No puedes completar más tareas.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    if (task.completed && this.claimedMilestones.length > 0) {
      this.snackBar.open('No puedes desmarcar tareas después de reclamar una recompensa.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    task.completed = !task.completed;
    this.calculateProgress();
    this.saveTaskCompletion();
  }

  private hasLogged500Today = false;

  calculateProgress(): void {
    const previousProgress = this.progress;

    this.progress = this.tasks
      .filter(t => t.completed)
      .reduce((sum, task) => sum + task.points, 0);

    // Detectar si acaba de alcanzar los 500 puntos
    if (this.progress >= 500 && previousProgress < 500 && !this.hasLogged500Today) {
      const userIdStr = localStorage.getItem('userId');
      const userId = userIdStr ? Number(userIdStr) : undefined;

      if (userId !== undefined) {
        const today = new Date().toISOString().split('T')[0];
        const logKey = `wuwa_logged500_${userId}_${today}`;
        const alreadyLogged = localStorage.getItem(logKey);

        if (!alreadyLogged) {
          this.statsService.log500PointsDay(userId, 'wuwa').subscribe({
            next: () => {
              this.hasLogged500Today = true;
              localStorage.setItem(logKey, 'true');
              console.log('✅ Día con 500 puntos registrado en la base de datos.');
            },
            error: (err) => {
              console.error('❌ Error al registrar el día de 500 puntos:', err);
            }
          });
        }
      } else {
        console.error('No hay userId válido para registrar día 500 puntos.');
      }
    }
  }


  claimReward(milestone: number): void {
    if (this.progress >= milestone && !this.claimedMilestones.includes(milestone)) {
      this.claimedMilestones.push(milestone);
      this.saveClaimedMilestones();
      console.log(`Recompensa de ${milestone} reclamada`);
    }
  }

  private getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  private getStorageKey(suffix: string): string | null {
    const email = this.getUserEmail();
    return email ? `wuwa_${suffix}_${email}` : null;
  }


  private saveClaimedMilestones(): void {
    const today = new Date().toISOString().split('T')[0];
    const data = {
      date: today,
      claimed: this.claimedMilestones,
    };
    const key = this.getStorageKey('claimedMilestones');
    if (key) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  private loadClaimedMilestones(): void {
    const key = this.getStorageKey('claimedMilestones');
    if (!key) return;

    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        if (data.date === today) {
          this.claimedMilestones = data.claimed;
        } else {
          this.claimedMilestones = [];
          this.clearTaskCompletion();
        }
      } catch (e) {
        console.error('Error al leer cofres guardados', e);
        this.claimedMilestones = [];
      }
    }
  }

  private saveTaskCompletion(): void {
    const today = new Date().toISOString().split('T')[0];
    const completedTaskNames = this.tasks.filter(t => t.completed).map(t => t.name);
    const key = this.getStorageKey('completedTasks');
    if (key) {
      localStorage.setItem(key, JSON.stringify({ date: today, completed: completedTaskNames }));
    }
  }

  private loadTaskCompletion(): string[] {
    const key = this.getStorageKey('completedTasks');
    if (!key) return [];

    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        if (data.date === today) {
          return data.completed;
        } else {
          return [];
        }
      } catch (e) {
        console.error('Error al leer tareas completadas', e);
        return [];
      }
    }
    return [];
  }

  private clearTaskCompletion(): void {
    const key = this.getStorageKey('completedTasks');
    if (key) {
      localStorage.removeItem(key);
    }
  }

  scrollHorizontally(event: WheelEvent): void {
    const grid = document.querySelector('.task-grid');
    if (grid) {
      event.preventDefault();
      grid.scrollLeft += event.deltaY;
    }
  }

  toggleMusic(): void {
    this.musicService.toggle();
    this.isPlaying = this.musicService.isPlaying;
  }

  adjustVolume(): void {
    this.musicService.setVolume(this.volume);
  }

  nextTrack(): void {
    this.musicService.nextTrack();
  }
  goBack() {
    this.location.back();
  }
  goForward() {
    this.location.forward();
  }

}
