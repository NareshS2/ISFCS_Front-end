import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8081/api/users/me';

export interface ParticipationStats {
  pendingSurveys: number;
  completedSurveys: number;
  completionRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {
  constructor(private http: HttpClient) {}

  getEmployeeProfile(): Observable<any> {
    return this.http.get<any>(`${API_URL}`);
  }

  getUserSurveys(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${API_URL}/surveys?page=${page}&size=${size}`);
  }

  calculateParticipationStats(surveys: any[]): ParticipationStats {
    const pending = surveys.filter(s => !s.completed).length;
    const completed = surveys.filter(s => s.completed).length;
    const total = surveys.length;
    const rate = total > 0 ? (completed / total) * 100 : 0;

    return {
      pendingSurveys: pending,
      completedSurveys: completed,
      completionRate: parseFloat(rate.toFixed(2))
    };
  }
}
