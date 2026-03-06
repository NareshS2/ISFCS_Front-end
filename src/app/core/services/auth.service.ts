import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const API_URL = 'http://localhost:8081/api/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<any> {
    console.log('Attempting login with:', credentials.email);
    return this.http.post<any>(`${API_URL}/login`, credentials).pipe(
      tap(response => {
        console.log('Login response received:', response);
        if (response.data) {
          console.log('Token stored:', response.data.accessToken.substring(0, 20) + '...');
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('userEmail', response.data.email);
          localStorage.setItem('userRole', response.data.role);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${API_URL}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}
