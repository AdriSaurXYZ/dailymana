import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TasksComponent } from './tasks/tasks.component';
import { HomeComponent } from './home/home.component';
import { DiariasComponent } from './daily/daily.component';
import {HomeMenuComponent} from './homeMenu/home-menu.component';  // Importa el componente
import { CharactersComponent } from './characters/characters.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'diarias', component: DiariasComponent },  // Nueva ruta para tareas diarias
  {path: 'home', component: HomeMenuComponent}, // Ruta para la pantalla de inicio
  { path: 'glosario', component: CharactersComponent },
];
