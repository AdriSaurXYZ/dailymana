import { OnInit, ChangeDetectorRef } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { MusicService } from '../services/music.service'; // Importa el servicio de música
import { HttpClientModule } from '@angular/common/http';

export interface TodoItem {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  showDescription: boolean;
  category: string;
  createdAt: Date;
  dueDate: Date | null;
  image_url?: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDrag, CdkDropList, HttpClientModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  volume: number = 0.5;
  isPlaying: boolean = true;
  title = 'angular-todo';
  todoMap: { [category: string]: TodoItem[] } = {};
  newTask = '';
  newDescription = '';
  newCategory = '';
  selectedCategory = '';
  newDueDate = '';
  errorMessage = '';
  editTaskIndex: number | null = null;
  editTask = '';
  editDescription = '';
  hiddenCategories: boolean[] = [];
  isDarkMode = false;

  constructor(private cdr: ChangeDetectorRef, private router: Router, private apiService: ApiService, public musicService: MusicService) {}

  hoverSound: HTMLAudioElement | null = typeof Audio !== 'undefined' ? new Audio('assets/hover.mp3') : null;
  clickSound: HTMLAudioElement | null = typeof Audio !== 'undefined' ? new Audio('assets/click.mp3') : null;

  ngOnInit(): void {
    this.isPlaying = this.musicService.isPlaying;
    this.volume = this.musicService.volume;
    this.musicService.setVolume(this.volume);
    this.apiService.getTasks().subscribe((tasks: TodoItem[]) => {
      tasks.forEach((task: any) => {
        task.category = task.categoryName || 'Sin categoría';
        task.createdAt = new Date(task.start_date);
        task.dueDate = task.due_date ? new Date(task.due_date) : null;
        task.completed = task.status === 'completed';
      });
      this.todoMap = this.groupTasksByCategory(tasks);
    });

    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.updateTheme();
  }

  private groupTasksByCategory(tasks: TodoItem[]): { [category: string]: TodoItem[] } {
    return tasks.reduce((map: { [category: string]: TodoItem[] }, task) => {
      if (!map[task.category]) {
        map[task.category] = [];
      }
      map[task.category].push(task);
      return map;
    }, {} as { [category: string]: TodoItem[] });
  }

  addTask(): void {
    const category = this.selectedCategory === 'new' ? this.newCategory : this.selectedCategory;

    if (category.trim() === '') {
      this.errorMessage = 'Debe seleccionar o ingresar una categoría.';
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newTask);
    formData.append('description', this.newDescription);
    formData.append('categoryName', category);  // ya calculaste 'category' correctamente arriba
    formData.append('start_date', new Date().toISOString());
    formData.append('due_date', new Date(this.newDueDate).toISOString());
    if (this.taskImageFile) {
      formData.append('image', this.taskImageFile);
    }

    this.apiService.addTask(formData).subscribe({
      next: (task: any) => {
        const newTaskObj: TodoItem = {
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.status === 'completed',
          showDescription: false,
          category: task.categoryName || category,
          createdAt: new Date(task.start_date),
          dueDate: task.due_date ? new Date(task.due_date) : null,
          image_url: task.image_url
        };

        if (!this.todoMap[newTaskObj.category]) {
          this.todoMap[newTaskObj.category] = [];
        }

        this.todoMap[newTaskObj.category].push(newTaskObj);
        this.hiddenCategories = this.getCategories().map(() => false);
        this.saveTasks();
        this.resetForm();
        this.cdr.detectChanges();  // fuerza actualización de vista si es necesario
      },
      error: (err) => {
        this.errorMessage = 'No se pudo agregar la tarea. Inténtalo de nuevo.';
      }
    });
  }


  private resetForm(): void {
    this.newTask = '';
    this.newDescription = '';
    this.newCategory = '';
    this.selectedCategory = '';
    this.newDueDate = '';
    this.errorMessage = '';
    this.hiddenCategories = this.getCategories().map(() => false);
  }

  drop(event: CdkDragDrop<TodoItem[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedTask = event.item.data;
      const prevCategory = event.previousContainer.id;
      const newCategory = event.container.id;

      if (!this.todoMap[newCategory]) {
        this.todoMap[newCategory] = [];
      }

      movedTask.category = newCategory;

      transferArrayItem(
        this.todoMap[prevCategory],
        this.todoMap[newCategory],
        event.previousIndex,
        event.currentIndex
      );

      // Actualiza categoría en el backend
      this.apiService.updateTaskCategoryAndOrder(movedTask.id, newCategory).subscribe({
        next: () => console.log('Tarea actualizada correctamente en el backend.'),
        error: err => console.error('Error al actualizar la categoría de la tarea:', err)
      });
    }

    this.saveTasks();
  }


  getCategories(): string[] {
    return Object.keys(this.todoMap);
  }

  getTasksByCategory(category: string): TodoItem[] {
    return this.todoMap[category] || [];
  }

  toggleCompleted(task: TodoItem): void {
    task.completed = !task.completed;
    const newStatus = task.completed ? 'completed' : 'pending';

    this.apiService.updateTaskStatus(task.id, task.completed).subscribe({
      next: () => {
        if (task.completed && this.editTaskIndex === task.id) {
          this.editTaskIndex = null;
          this.editTask = '';
          this.editDescription = '';
        }
        if (task.completed) {
          task.showDescription = false;
        }
      },
      error: (err) => {
        console.error('Error al actualizar el estado de la tarea:', err);
      }
    });
  }

  deleteTask(id: number): void {
    this.apiService.deleteTask(id).subscribe({
      next: () => {
        for (const category of this.getCategories()) {
          this.todoMap[category] = this.todoMap[category].filter(item => item.id !== id);
        }
        this.saveTasks();
      },
      error: err => {
        console.error('Error al eliminar la tarea:', err);
      }
    });
  }


  toggleDescription(task: TodoItem): void {
    if (!task.completed) task.showDescription = !task.showDescription;
  }

  startEditTask(task: TodoItem): void {
    this.editTaskIndex = task.id;
    this.editTask = task.title;
    this.editDescription = task.description;
  }

  saveEditTask(): void {
    if (this.editTaskIndex === null) return;

    const taskToUpdate = {
      id: this.editTaskIndex,
      title: this.editTask,
      description: this.editDescription
    };

    this.apiService.updateTask(taskToUpdate).subscribe({
      next: () => {
        for (const category of this.getCategories()) {
          const task = this.todoMap[category].find(t => t.id === this.editTaskIndex);
          if (task) {
            task.title = this.editTask;
            task.description = this.editDescription;
            break;
          }
        }

        this.editTaskIndex = null;
        this.editTask = '';
        this.editDescription = '';
        this.saveTasks();
      },
      error: (err) => {
        console.error('Error al actualizar la tarea:', err);
      }
    });
  }



  onCategoryChange(): void {
    if (this.selectedCategory !== 'new') {
      this.newCategory = '';
    }
  }

  onNewCategoryInput(): void {
    if (this.newCategory.trim() !== '') {
      this.selectedCategory = 'new';
    }
  }

  toggleCategoryVisibility(index: number): void {
    this.hiddenCategories[index] = !this.hiddenCategories[index];
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    console.log('Theme toggled:', this.isDarkMode ? 'Dark' : 'Light');
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.updateTheme();
    this.cdr.detectChanges();
  }

  private updateTheme(): void {
    setTimeout(() => {
      const body = document.body;
      if (this.isDarkMode) {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
      } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
      }
      this.cdr.detectChanges();
    });
  }

  private formatLocalDateTime(dateString: string): string {
    // dateString = "2025-05-28T14:00"
    const [datePart, timePart] = dateString.split('T');
    return `${datePart} ${timePart}:00`; // Agrega los segundos manualmente
  }



  saveTasks(): void {
    localStorage.setItem('todoMap', JSON.stringify(this.todoMap));
  }

  loadTasks(): void {
    const saved = localStorage.getItem('todoMap');
    if (saved) {
      const rawMap = JSON.parse(saved);
      for (const category in rawMap) {
        this.todoMap[category] = rawMap[category].map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          dueDate: item.dueDate ? new Date(item.dueDate) : null
        }));
      }
    }
  }

  logout(): void {
    localStorage.removeItem('userToken');
    this.router.navigate(['/login']);
  }

  deleteCategory(category: string): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${category}" y todas sus tareas?`)) {
      return;
    }

    // Elimina del backend cada tarea
    const tasksToDelete = this.todoMap[category] || [];
    let completedRequests = 0;

    tasksToDelete.forEach(task => {
      this.apiService.deleteTask(task.id).subscribe({
        next: () => {
          completedRequests++;
          if (completedRequests === tasksToDelete.length) {
            // Elimina categoría localmente después de borrar todo
            delete this.todoMap[category];
            this.hiddenCategories = this.getCategories().map(() => false);
            this.saveTasks();
          }
        },
        error: err => {
          console.error(`Error al eliminar tarea con id ${task.id}:`, err);
        }
      });
    });

    // Si no hay tareas, igual se puede eliminar localmente
    if (tasksToDelete.length === 0) {
      delete this.todoMap[category];
      this.hiddenCategories = this.getCategories().map(() => false);
      this.saveTasks();
    }
  }

  taskImageFile: File | null = null;
  categoryImageFile: File | null = null;

  onTaskImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.taskImageFile = input.files[0];
    }
  }

  onCategoryImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.categoryImageFile = input.files[0];
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



