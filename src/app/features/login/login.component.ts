import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('🔐 Login attempt:', {
      email: this.loginForm.value.email,
      timestamp: new Date().toISOString(),
      apiUrl: 'http://localhost:8081/api/auth/login'
    });

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('✅ Login successful!', {
          email: response.data?.email,
          role: response.data?.role,
          hasToken: !!response.data?.accessToken
        });
        this.isLoading = false;
        if (response.data) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('❌ Login failed with error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.error?.message,
          fullError: error.error,
          url: error.url
        });
        this.isLoading = false;
        const errorMsg = this.getErrorMessage(error);
        this.errorMessage = errorMsg;
        console.log('💬 Error message for user:', errorMsg);
      }
    });
  }

  private getErrorMessage(error: any): string {
    // Network/CORS errors
    if (error.status === 0) {
      return 'Cannot connect to server. Ensure backend is running on port 8081.';
    }
    // Bad credentials
    if (error.status === 401) {
      return 'Invalid email or password.';
    }
    // CORS/CSRF/Permission
    if (error.status === 403) {
      return 'Access denied. Check credentials or contact admin.';
    }
    // Bad request format
    if (error.status === 400) {
      return error.error?.message || 'Invalid request format.';
    }
    // Server error
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    // Default error handling
    return error.error?.message || error.error?.data?.message || 'Login failed. Please try again.';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get emailError(): string {
    const control = this.loginForm.get('email');
    if (control?.hasError('required')) return 'Email is required';
    if (control?.hasError('email')) return 'Please enter a valid email';
    return '';
  }

  get passwordError(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) return 'Password is required';
    if (control?.hasError('minlength')) return 'Password must be at least 6 characters';
    return '';
  }
}
