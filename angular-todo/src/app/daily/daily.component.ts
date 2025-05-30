import {Component, ElementRef, OnInit, ViewChild, Inject} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../services/notification.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MusicService } from '../services/music.service';

interface Task {
  name: string;
  progress: number;
  goal: number;
  completed: boolean;
  points: number;
}

@Component({
  selector: 'app-diarias',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, ReactiveFormsModule, FormsModule],
  templateUrl: './daily.component.html',
  styleUrls: ['./daily.component.css'],
})
export class DiariasComponent implements OnInit {
  volume: number = 0.5;
  isPlaying: boolean = true;
  tasks: Task[] = [];
  timer: string = '';
  progress: number = 0;
  rewardMilestones: number[] = [100, 200, 300, 400, 500];
  claimedMilestones: number[] = [];
  maxPoints: number = 500;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    public musicService: MusicService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  hoverSound = new Audio('assets/hover.mp3');
  clickSound = new Audio('assets/click.mp3');

  ngOnInit(): void {
    this.isPlaying = this.musicService.isPlaying;
    this.volume = this.musicService.volume;
    this.musicService.setVolume(this.volume);

    this.notificationService.checkAndShowNotifications();

    this.loadClaimedMilestones();
    this.loadTaskCompletion();
    this.initializeTasks();
    this.calculateProgress();
    this.updateTimer();

    setInterval(() => this.updateTimer(), 1000);
  }

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
      { name: 'Inicia sesión en el juego', progress: 0, goal: 1, completed: false, points: 100 },
      { name: 'Consume 120 pts. de Poder trazacaminos', progress: 0, goal: 120, completed: false, points: 200 },
      { name: 'Utiliza la máquina sintetizadora multiusos 1 vez', progress: 0, goal: 1, completed: false, points: 100 },
      { name: 'Asigna 1 encargo', progress: 0, goal: 1, completed: false, points: 100 },
      { name: 'Completa 1 misión diaria', progress: 0, goal: 1, completed: false, points: 200 },
      { name: 'Derrota a 20 enemigos', progress: 0, goal: 20, completed: false, points: 100 },
      { name: 'Gana 1 batalla utilizando personajes de apoyo', progress: 0, goal: 1, completed: false, points: 200 },
      { name: 'Inflije ruptura de debilidad 5 veces', progress: 0, goal: 5, completed: false, points: 100 },
      { name: 'Mejora cualquier artefacto una vez', progress: 0, goal: 1, completed: false, points: 100 },
      { name: 'Completa el Universo Simulado 1 vez', progress: 0, goal: 1, completed: false, points: 500 },
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

  calculateProgress(): void {
    this.progress = this.tasks
      .filter(t => t.completed)
      .reduce((sum, task) => sum + task.points, 0);
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
    return email ? `${suffix}_${email}` : null;
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
    if (typeof this.document !== 'undefined') {
      const grid = this.document.querySelector('.task-grid');
      if (grid) {
        event.preventDefault();
        grid.scrollLeft += event.deltaY;
      }
    }
  }

  toggleMusic(): void {
    this.musicService.toggle();
    this.isPlaying = this.musicService.isPlaying;
  }

  adjustVolume(): void {
    this.musicService.setVolume(this.volume);
  }
}
