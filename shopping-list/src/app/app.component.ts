import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApplicationUser } from './dtos/application-user';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public currentUser$: Observable<ApplicationUser | null>;
  
  constructor(private authService: AuthService, private router: Router) { 
    this.currentUser$ = this.authService.currentUser$;
  }

  public logout(): void {
    this.authService.logout().subscribe(_ => {
      this.router.navigate(['']);
    });
  }
}
