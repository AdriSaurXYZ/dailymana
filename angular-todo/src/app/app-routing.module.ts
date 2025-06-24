import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DiariasComponent } from './daily/daily.component';
import {HomeMenuComponent} from './homeMenu/home-menu.component';
import {TasksComponent} from './tasks/tasks.component';
import {StatsComponent} from './stats/stats.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeMenuComponent }, // pantalla puente/interfaz principal
  { path: 'diarias', component: DiariasComponent },
  { path: 'tasks', component: TasksComponent },
  { path: '**', redirectTo: 'login' },
  { path: 'stats', component: StatsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
