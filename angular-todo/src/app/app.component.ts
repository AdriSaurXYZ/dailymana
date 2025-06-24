import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar'; // ✅

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    MatSnackBarModule               // ✅ Aquí va correctamente
  ],
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-todo';
}
