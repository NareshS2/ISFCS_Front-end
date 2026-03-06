import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const role = localStorage.getItem('userRole');
    if (role) {
      const routePath = role.toLowerCase() === 'employee' 
        ? 'employee' 
        : role.toLowerCase() === 'manager' 
        ? 'manager' 
        : 'admin';
      this.router.navigate(['/dashboard', routePath]);
    }
  }
}
