import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TasksComponent } from './tasks/tasks.component';
import { HomeComponent } from './home/home.component';
import { DiariasComponent } from './daily/daily.component';
import {HomeMenuComponent} from './homeMenu/home-menu.component';  // Importa el componente
import { CharactersComponent } from './characters/characters.component';
import { StatsComponent } from './stats/stats.component';
import {Wuwa_loginComponent} from './wuwa_login/wuwa_login.component';
import {Wuwa_registerComponent} from './wuwa_register/wuwa_register.component';
import {Wuwa_homeMenuComponent} from './wuwa_homeMenu/wuwa_home-menu.component';
import {Wuwa_tasksComponent} from './wuwa_tasks/wuwa_tasks.component';
import {Wuwa_charactersComponent} from './wuwa_characters/wuwa_characters.component';
import {Wuwa_statsComponent} from './wuwa_stats/wuwa_stats.component';
import { Wuwa_diariasComponent } from './wuwa_daily/wuwa_daily.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'diarias', component: DiariasComponent },  // Nueva ruta para tareas diarias
  {path: 'home', component: HomeMenuComponent}, // Ruta para la pantalla de inicio
  { path: 'glosario', component: CharactersComponent },
  {path: 'stats', component: StatsComponent},
  { path: 'wuwa-login', component: Wuwa_loginComponent },
  { path: 'wuwa-register', component: Wuwa_registerComponent },
  {path: 'wuwa-home', component: Wuwa_homeMenuComponent},
  { path: 'wuwa-diarias', component: Wuwa_diariasComponent },  // Nueva ruta para tareas diarias
  { path: 'wuwa-tasks', component: Wuwa_tasksComponent },
  { path: 'wuwa-glosario', component: Wuwa_charactersComponent },
  {path: 'wuwa-stats', component: Wuwa_statsComponent},
];
