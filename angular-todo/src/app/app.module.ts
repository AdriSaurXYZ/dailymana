import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations'; // Requerido por Angular Material
import { StatsComponent } from './stats/stats.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),             // ✅ Ya provee HttpClient
    provideAnimations()              // ✅ Necesario para Angular Material (como MatSnackBar)
  ]


}).catch(err => console.error(err));
