import { Component } from '@angular/core';
import { Router } from '@angular/router'; // 1. Import Router
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})

export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email;

      if (email.includes('manager')) {
        this.router.navigate(['/manager-dashboard']); // Points to the new route
      }
      else if (email.includes('admin')) {
        this.router.navigate(['/admin-dashboard']); // Points to the new route
      }
      else {
        this.router.navigate(['/dashboard']);
      }
    }
  }
}
