// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { ApiService } from './app/services/api.service';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {importProvidersFrom} from '@angular/core'; // 👈 Importar ApiService

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(MatSnackBarModule),
    ApiService // 👈 Agregar este provider
  ]
}).catch(err => console.error(err));
